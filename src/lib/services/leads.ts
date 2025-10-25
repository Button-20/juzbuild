import { getCollection, getUserCollection } from "@/lib/mongodb";
import {
  CreateLeadData,
  Lead,
  LeadFilter,
  LeadSource,
  LeadStats,
  LeadStatus,
  UpdateLeadData,
} from "@/types/leads";
import { ObjectId } from "mongodb";

export class LeadService {
  private static COLLECTION = "leads";

  /**
   * Create a new lead
   */
  static async create(
    data: CreateLeadData,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Lead> {
    let collection;
    if (userId) {
      collection = await getUserCollection(this.COLLECTION, userId);
    } else {
      collection = await getCollection(this.COLLECTION);
    }

    const leadData = {
      ...data,
      _id: new ObjectId(),
      userId,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastContactDate: undefined,
      nextFollowUpDate: data.nextFollowUpDate
        ? new Date(data.nextFollowUpDate)
        : undefined,
    };

    const result = await collection.insertOne(leadData);

    if (!result.insertedId) {
      throw new Error("Failed to create lead");
    }

    return {
      ...leadData,
      _id: result.insertedId.toString(),
    };
  }

  /**
   * Find all leads with filtering, pagination, and sorting
   */
  static async findAll(filters: LeadFilter): Promise<{
    leads: Lead[];
    total: number;
  }> {
    let collection;
    if (filters.userId) {
      collection = await getUserCollection(this.COLLECTION, filters.userId);
    } else {
      collection = await getCollection(this.COLLECTION);
    }

    // Build MongoDB query
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo;
    }

    if (filters.propertyInterest) {
      query.propertyInterest = filters.propertyInterest;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
        { phone: { $regex: filters.search, $options: "i" } },
        { company: { $regex: filters.search, $options: "i" } },
        { subject: { $regex: filters.search, $options: "i" } },
        { message: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Date range filters
    if (filters.createdAfter || filters.createdBefore) {
      query.createdAt = {};
      if (filters.createdAfter) {
        query.createdAt.$gte = new Date(filters.createdAfter);
      }
      if (filters.createdBefore) {
        query.createdAt.$lte = new Date(filters.createdBefore);
      }
    }

    // Multi-tenant filtering
    if (filters.userId) {
      query.userId = filters.userId;
    }

    // Count total documents
    const total = await collection.countDocuments(query);

    // Build sort object
    const sort: any = {};
    sort[filters.sortBy!] = filters.sortDirection === "asc" ? 1 : -1;

    // Execute query with pagination
    const skip = (filters.page - 1) * filters.limit;
    const cursor = collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(filters.limit);

    const leads = await cursor.toArray();

    return {
      leads: leads.map((lead: any) => ({
        ...lead,
        _id: lead._id.toString(),
      })),
      total,
    };
  }

  /**
   * Find a single lead by ID
   */
  static async findById(id: string, userId?: string): Promise<Lead | null> {
    let collection;
    if (userId) {
      collection = await getUserCollection(this.COLLECTION, userId);
    } else {
      collection = await getCollection(this.COLLECTION);
    }

    const query: any = { _id: new ObjectId(id) };
    if (userId) {
      query.userId = userId;
    }

    const lead = await collection.findOne(query);

    if (!lead) {
      return null;
    }

    return {
      ...lead,
      _id: lead._id.toString(),
    };
  }

  /**
   * Update a lead
   */
  static async update(
    id: string,
    data: UpdateLeadData,
    userId?: string
  ): Promise<Lead | null> {
    let collection;
    if (userId) {
      collection = await getUserCollection(this.COLLECTION, userId);
    } else {
      collection = await getCollection(this.COLLECTION);
    }

    const query: any = { _id: new ObjectId(id) };
    if (userId) {
      query.userId = userId;
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
      lastContactDate: data.lastContactDate
        ? new Date(data.lastContactDate)
        : undefined,
      nextFollowUpDate: data.nextFollowUpDate
        ? new Date(data.nextFollowUpDate)
        : undefined,
    };

    const result = await collection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return null;
    }

    return {
      ...result,
      _id: result._id.toString(),
    };
  }

  /**
   * Delete a lead
   */
  static async delete(id: string, userId?: string): Promise<boolean> {
    let collection;
    if (userId) {
      collection = await getUserCollection(this.COLLECTION, userId);
    } else {
      collection = await getCollection(this.COLLECTION);
    }

    const query: any = { _id: new ObjectId(id) };
    if (userId) {
      query.userId = userId;
    }

    const result = await collection.deleteOne(query);
    return result.deletedCount === 1;
  }

  /**
   * Get lead statistics
   */
  static async getStats(userId?: string): Promise<LeadStats> {
    let collection;
    if (userId) {
      collection = await getUserCollection(this.COLLECTION, userId);
    } else {
      collection = await getCollection(this.COLLECTION);
    }

    const query: any = {};
    if (userId) {
      query.userId = userId;
    }

    // Total leads
    const total = await collection.countDocuments(query);

    // Leads by status
    const statusCounts = await collection
      .aggregate([
        { $match: query },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])
      .toArray();

    const statusMap = statusCounts.reduce(
      (acc: Record<string, number>, item: any) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    // This month's leads
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const thisMonth = await collection.countDocuments({
      ...query,
      createdAt: { $gte: thisMonthStart },
    });

    // Last month's leads
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const lastMonthEnd = new Date(thisMonthStart);
    lastMonthEnd.setTime(lastMonthEnd.getTime() - 1);

    const lastMonth = await collection.countDocuments({
      ...query,
      createdAt: {
        $gte: lastMonthStart,
        $lte: lastMonthEnd,
      },
    });

    // Calculate conversion rate
    const converted = statusMap[LeadStatus.CONVERTED] || 0;
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    // Calculate monthly growth
    const monthlyGrowth =
      lastMonth > 0
        ? ((thisMonth - lastMonth) / lastMonth) * 100
        : thisMonth > 0
        ? 100
        : 0;

    return {
      total,
      new: statusMap[LeadStatus.NEW] || 0,
      contacted: statusMap[LeadStatus.CONTACTED] || 0,
      qualified: statusMap[LeadStatus.QUALIFIED] || 0,
      converted,
      conversionRate: Math.round(conversionRate * 100) / 100,
      thisMonth,
      lastMonth,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
    };
  }

  /**
   * Convert contact form submission to lead
   */
  static async createFromContact(
    contactData: {
      name: string;
      email: string;
      phone?: string;
      company?: string;
      subject: string;
      message: string;
    },
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Lead> {
    // Determine priority based on subject and message content
    let priority = "medium";
    const priorityKeywords = {
      urgent: ["urgent", "asap", "immediate", "emergency"],
      high: ["demo", "meeting", "partnership", "invest", "buy now"],
      low: ["info", "information", "general", "question"],
    };

    const text = `${contactData.subject} ${contactData.message}`.toLowerCase();

    if (priorityKeywords.urgent.some((keyword) => text.includes(keyword))) {
      priority = "urgent";
    } else if (
      priorityKeywords.high.some((keyword) => text.includes(keyword))
    ) {
      priority = "high";
    } else if (priorityKeywords.low.some((keyword) => text.includes(keyword))) {
      priority = "low";
    }

    const leadData: CreateLeadData = {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone || "",
      company: contactData.company || "",
      source: LeadSource.CONTACT_FORM,
      status: LeadStatus.NEW,
      priority: priority as any,
      subject: contactData.subject,
      message: contactData.message,
      tags: this.generateTagsFromContent(text),
    };

    return this.create(leadData, userId, ipAddress, userAgent);
  }

  /**
   * Generate relevant tags from content
   */
  private static generateTagsFromContent(content: string): string[] {
    const tags: string[] = [];
    const tagKeywords = {
      demo: ["demo", "demonstration", "show"],
      partnership: ["partner", "partnership", "collaborate"],
      investment: ["invest", "investment", "capital"],
      support: ["support", "help", "assistance"],
      pricing: ["price", "pricing", "cost", "fee"],
      technical: ["technical", "tech", "integration", "api"],
    };

    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some((keyword) => content.includes(keyword))) {
        tags.push(tag);
      }
    });

    return tags;
  }

  /**
   * Bulk update leads
   */
  static async bulkUpdate(
    ids: string[],
    updateData: Partial<UpdateLeadData>,
    userId?: string
  ): Promise<number> {
    let collection;
    if (userId) {
      collection = await getUserCollection(this.COLLECTION, userId);
    } else {
      collection = await getCollection(this.COLLECTION);
    }

    const query: any = {
      _id: { $in: ids.map((id) => new ObjectId(id)) },
    };
    if (userId) {
      query.userId = userId;
    }

    const result = await collection.updateMany(query, {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return result.modifiedCount;
  }

  /**
   * Get leads assigned to a specific user
   */
  static async findByAssignee(
    assigneeId: string,
    userId?: string
  ): Promise<Lead[]> {
    const filters: LeadFilter = {
      assignedTo: assigneeId,
      userId,
      page: 1,
      limit: 1000, // Get all assigned leads
      sortBy: "nextFollowUpDate",
      sortDirection: "asc",
    };

    const result = await this.findAll(filters);
    return result.leads;
  }
}
