import connectDB from "@/lib/mongodb";
import {
  CreateUserInput,
  CreateUserSchema,
  UpdateUserInput,
  UpdateUserSchema,
  User,
} from "@/schemas/User";
import bcryptjs from "bcryptjs";
import { ObjectId } from "mongodb";

export class UserService {
  private static async getCollection() {
    const { db } = await connectDB();
    return db.collection<User>("users");
  }

  // Create a new user
  static async create(data: CreateUserInput): Promise<User> {
    const validatedData = CreateUserSchema.parse(data);
    const collection = await this.getCollection();

    // Hash password if provided
    if (validatedData.password) {
      validatedData.password = await bcryptjs.hash(validatedData.password, 12);
    }

    const userData = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(userData);
    return {
      ...userData,
      _id: result.insertedId,
    };
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({ _id: new ObjectId(id) } as any);
    return user || null;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email });
    return user || null;
  }

  // Find user by provider ID
  static async findByProviderId(
    provider: string,
    providerId: string
  ): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({ provider, providerId } as any);
    return user || null;
  }

  // Update user
  static async update(id: string, data: UpdateUserInput): Promise<User | null> {
    const validatedData = UpdateUserSchema.parse(data);
    const collection = await this.getCollection();

    // Hash password if being updated
    if (validatedData.password) {
      validatedData.password = await bcryptjs.hash(validatedData.password, 12);
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as any,
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result || null;
  }

  // Delete user
  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as any);
    return result.deletedCount > 0;
  }

  // Find all users with pagination
  static async findAll(
    options: {
      limit?: number;
      skip?: number;
      filter?: Record<string, any>;
    } = {}
  ): Promise<{ users: User[]; total: number }> {
    const { limit = 10, skip = 0, filter = {} } = options;
    const collection = await this.getCollection();

    const [users, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return {
      users,
      total,
    };
  }

  // Compare password
  static async comparePassword(
    user: User,
    candidatePassword: string
  ): Promise<boolean> {
    if (!user.password) return false;
    return bcryptjs.compare(candidatePassword, user.password);
  }

  // Update last login
  static async updateLastLogin(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne({ _id: new ObjectId(id) } as any, {
      $set: { lastLogin: new Date() },
    });
  }

  // Set password reset token
  static async setPasswordResetToken(
    id: string,
    token: string,
    expires: Date
  ): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne({ _id: new ObjectId(id) } as any, {
      $set: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });
  }

  // Find user by reset token
  static async findByResetToken(token: string): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    return user || null;
  }

  // Clear password reset token
  static async clearPasswordResetToken(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne({ _id: new ObjectId(id) } as any, {
      $unset: {
        resetPasswordToken: "",
        resetPasswordExpires: "",
      },
    });
  }
}
