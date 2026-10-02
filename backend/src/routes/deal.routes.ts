import { Router, Request, Response } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { createAuditLog, prisma } from "../utils/audit";

const router = Router();

router.get("/deals", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const isAgent = req.user?.role === "AGENT";
    let whereClause: any = {};
    if (isAgent && req.user?.id) {
      const agentProps = await prisma.property.findMany({ where: { agentId: req.user.id }, select: { id: true } });
      const agentPropIds = agentProps.map((p) => p.id);
      whereClause = {
        OR: [{ agentId: req.user.id }, { propertyId: { in: agentPropIds } }],
      };
    }

    const deals = await prisma.deal.findMany({
      where: whereClause,
      include: { broker: true },
      orderBy: { createdAt: "desc" },
    });

    // Populate property and client information for rich details
    const populatedDeals = await Promise.all(
      deals.map(async (d) => {
        const prop = await prisma.property.findUnique({
          where: { id: d.propertyId },
          select: { id: true, propertyId: true, address: true, type: true, listingType: true, price: true, agentId: true },
        });
        const client = d.clientId
          ? await prisma.client.findUnique({
              where: { id: d.clientId },
              select: { id: true, clientId: true, name: true, phone: true },
            })
          : null;
        return {
          ...d,
          property: prop,
          client: client,
        };
      })
    );

    res.json(populatedDeals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/deals", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const {
      propertyId,
      clientId,
      clientName,
      amount,
      commission,
      brokerShare = 0,
      soldBy = "DIRECT",
      brokerId,
      brokerName,
      dealType = "SALE",
      agentId,
      agentName,
      notes,
    } = req.body;

    if (!propertyId || amount === undefined || commission === undefined) {
      return res.status(400).json({ message: "Property, amount and commission are required" });
    }

    const numAmount = Number(amount);
    const numCommission = Number(commission);
    const numBrokerShare = Number(brokerShare || 0);
    const netRevenue = Math.max(0, numCommission - numBrokerShare);

    // Determine attributing Sales Agent
    let finalAgentId = agentId || req.user?.id || null;
    let finalAgentName = agentName || null;

    if (finalAgentId && !finalAgentName) {
      const assignedUser = await prisma.user.findUnique({ where: { id: finalAgentId }, select: { name: true } });
      finalAgentName = assignedUser?.name || null;
    }
    if (!finalAgentId) {
      finalAgentId = req.user?.id || null;
      finalAgentName = req.user?.name || null;
    }

    const dealCount = await prisma.deal.count();
    const dealId = `DEAL-${1000 + dealCount + 1}`;

    // Create the deal
    const deal = await prisma.deal.create({
      data: {
        dealId,
        amount: numAmount,
        commission: numCommission,
        netRevenue,
        brokerShare: numBrokerShare,
        soldBy,
        dealType,
        brokerId: brokerId || null,
        brokerName: brokerName || null,
        propertyId,
        clientId: clientId || null,
        clientName: clientName || null,
        agentId: finalAgentId,
        agentName: finalAgentName,
        notes: notes || null,
      },
      include: { broker: true },
    });

    // Update Property status to SOLD or RENTED and update attributed agent
    const targetStatus = dealType === "RENT" ? "RENTED" : "SOLD";
    await prisma.property.update({
      where: { id: propertyId },
      data: { status: targetStatus, agentId: finalAgentId },
    });

    // Update Client pipeline step to CLOSED if client is selected
    if (clientId) {
      await prisma.client.update({
        where: { id: clientId },
        data: { pipelineStep: "CLOSED" },
      });
    }

    await createAuditLog(req.user?.id, req.user?.name, "CREATE_DEAL", {
      dealId,
      propertyId,
      amount: numAmount,
      commission: numCommission,
      netRevenue,
      brokerShare: numBrokerShare,
      soldBy,
      agentId: req.user?.id,
    });

    res.status(201).json(deal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
