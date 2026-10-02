import { Router, Response } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/audit";
import { calculateMatchScore } from "../matchingEngine";

const router = Router();

// 9. Dashboard Analytics Endpoint
router.get("/dashboard/stats", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const isAgent = req.user?.role === "AGENT";
    const agentId = req.user?.id;

    let agentPropIds: string[] = [];
    if (isAgent && agentId) {
      const myProps = await prisma.property.findMany({ where: { agentId }, select: { id: true } });
      agentPropIds = myProps.map((p) => p.id);
    }

    const totalProperties = await prisma.property.count();
    const propsForSale = await prisma.property.count({ where: { listingType: "SALE", status: "AVAILABLE" } });
    const propsForRent = await prisma.property.count({ where: { listingType: "RENT", status: "AVAILABLE" } });
    const totalClients = await prisma.client.count();
    const activeRequests = await prisma.client.count({
      where: { pipelineStep: { in: ["NEW", "INTERESTED", "NEGOTIATING"] } },
    });
    const totalOwners = await prisma.owner.count();
    
    // Revenue calculations: If Agent, calculate ONLY deals closed by this Agent
    const dealsWhere: any = (isAgent && agentId)
      ? { OR: [{ agentId }, { propertyId: { in: agentPropIds } }] }
      : {};

    const deals = await prisma.deal.findMany({ where: dealsWhere, include: { broker: true } });
    const totalRevenue = deals.reduce((acc, curr) => {
      const net = (curr.netRevenue !== undefined && curr.netRevenue !== null && curr.netRevenue > 0)
        ? curr.netRevenue
        : Math.max(0, curr.commission - (curr.brokerShare || 0));
      return acc + net;
    }, 0);

    // Matching opportunities counter
    const clients = await prisma.client.findMany({ include: { requirements: true } });
    const properties = await prisma.property.findMany({ where: { status: "AVAILABLE" } });
    
    let matchingOpportunitiesCount = 0;
    for (const client of clients) {
      if (!client.requirements) continue;
      for (const prop of properties) {
        const match = calculateMatchScore(
          {
            id: prop.id,
            propertyId: prop.propertyId,
            type: prop.type,
            listingType: prop.listingType,
            address: prop.address,
            area: prop.area,
            bedrooms: prop.bedrooms,
            furnished: prop.furnished,
            price: prop.price,
          },
          client.requirements
        );
        if (match.score >= 70) {
          matchingOpportunitiesCount++;
        }
      }
    }

    // Top Areas (analytical - calculated from Client Demands & Property Listings)
    const areaCounts: { [key: string]: number } = {};
    
    // 1. Demand from Client Requirements
    const allRequirements = await prisma.requirement.findMany({ select: { preferredAreas: true } });
    allRequirements.forEach((r: any) => {
      try {
        const areas: string[] = JSON.parse(r.preferredAreas || "[]");
        areas.forEach((a) => {
          const trimmed = a.trim();
          if (trimmed) {
            areaCounts[trimmed] = (areaCounts[trimmed] || 0) + 1;
          }
        });
      } catch (e) {
        if (r.preferredAreas) {
          const trimmed = r.preferredAreas.trim();
          if (trimmed) areaCounts[trimmed] = (areaCounts[trimmed] || 0) + 1;
        }
      }
    });

    // 2. Also incorporate Property Listings
    const allProps = await prisma.property.findMany({ select: { address: true } });
    allProps.forEach((p) => {
      const parts = p.address.split(",");
      const area = parts[0]?.trim() || "Other";
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    });

    const topAreas = Object.keys(areaCounts)
      .map((name) => ({ name, count: areaCounts[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sales by property type chart data
    const propTypes = ["APARTMENT", "VILLA", "OFFICE", "SHOP", "LAND"];
    const typeDistribution = await Promise.all(
      propTypes.map(async (t) => {
        const count = await prisma.property.count({ where: { type: t } });
        return { name: t, count };
      })
    );

    // Top Sales Closers (Ranked by actual closed deals count > 0)
    const allUsers = await prisma.user.findMany({ select: { id: true, name: true, role: true } });
    const allDeals = await prisma.deal.findMany({ select: { agentId: true, netRevenue: true } });

    const topAgents = allUsers
      .map((u) => {
        const dealsCount = allDeals.filter((d) => d.agentId === u.id).length;
        const totalProfit = allDeals
          .filter((d) => d.agentId === u.id)
          .reduce((acc, curr) => acc + (curr.netRevenue || 0), 0);
        return {
          id: u.id,
          name: u.name,
          role: u.role,
          dealsClosed: dealsCount,
          totalProfit,
        };
      })
      .filter((u) => u.dealsClosed > 0)
      .sort((a, b) => b.dealsClosed - a.dealsClosed || b.totalProfit - a.totalProfit)
      .slice(0, 5);

    // Recent Activities (If Agent, show only their activities)
    let recentLogs = await prisma.auditLog.findMany({
      where: (isAgent && agentId) ? { userId: agentId } : {},
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    if (isAgent && recentLogs.length === 0) {
      recentLogs = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
      });
    }

    res.json({
      totalProperties,
      propsForSale,
      propsForRent,
      totalClients,
      activeRequests,
      totalOwners,
      totalRevenue,
      matchingOpportunitiesCount,
      topAreas,
      typeDistribution,
      topAgents,
      recentActivities: recentLogs,
      isAgentPersonalView: isAgent,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
