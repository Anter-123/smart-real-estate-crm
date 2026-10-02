import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middleware/auth";
import { prisma } from "../utils/audit";
import { calculateMatchScore } from "../matchingEngine";

const router = Router();

router.get("/matching/opportunities", authenticateJWT, async (req: Request, res: Response) => {
  const { clientId, propertyId } = req.query;

  try {
    if (clientId) {
      // Find matching properties for a client
      const client = await prisma.client.findUnique({
        where: { id: String(clientId) },
        include: { requirements: true },
      });

      if (!client || !client.requirements) {
        return res.status(400).json({ message: "Client does not have requirements profiled" });
      }

      const properties = await prisma.property.findMany({
        where: { status: "AVAILABLE" },
        include: { agent: true, owner: true },
      });

      const matches = properties
        .map((prop) => {
          const matchDetails = calculateMatchScore(
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
            client.requirements!
          );
          return {
            property: prop,
            match: matchDetails,
          };
        })
        .filter((m) => m.match.score > 0)
        .sort((a, b) => b.match.score - a.match.score);

      return res.json(matches);
    }

    if (propertyId) {
      // Find matching clients for a property
      const prop = await prisma.property.findUnique({
        where: { id: String(propertyId) },
      });

      if (!prop) {
        return res.status(404).json({ message: "Property not found" });
      }

      const clients = await prisma.client.findMany({
        include: { requirements: true, agent: true },
      });

      const matches = clients
        .filter((c) => c.requirements !== null)
        .map((client) => {
          const matchDetails = calculateMatchScore(
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
            client.requirements!
          );
          return {
            client,
            match: matchDetails,
          };
        })
        .filter((m) => m.match.score > 0)
        .sort((a, b) => b.match.score - a.match.score);

      return res.json(matches);
    }

    // Default: Return all matching pairs
    const clients = await prisma.client.findMany({ include: { requirements: true } });
    const properties = await prisma.property.findMany({ where: { status: "AVAILABLE" } });

    const allMatches: any[] = [];
    for (const client of clients) {
      if (!client.requirements) continue;
      for (const prop of properties) {
        const matchDetails = calculateMatchScore(
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
        if (matchDetails.score >= 50) {
          allMatches.push({
            client,
            property: prop,
            score: matchDetails.score,
          });
        }
      }
    }

    res.json(allMatches.sort((a, b) => b.score - a.score));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
