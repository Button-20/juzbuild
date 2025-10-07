import { Property, propertyParser } from "@/models/Property";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import connectDB from "./mongodb";

const llm = new ChatOpenAI({
  temperature: 0.7,
  modelName: "gpt-4o-mini",
});

async function generateSyntheticProperties(): Promise<Property[]> {
  const prompt = `Generate a list of 15 diverse real estate properties with the following details for each property:
    - Name
    - Location
    - Price
    - Property Type (e.g., House, Apartment, Office)
    - Status (e.g., For Sale, For Rent, Sold, Rented)
    - Bedrooms
    - Bathroomsx
    - Area (in square meters)
    - Description
    - Image URLs (at least 2 per property)
    - Amenities (e.g., Pool, Gym, Parking)
    - Features (e.g., Sea View, Garden, Balcony)
    - Coordinates (latitude and longitude)
    - Currency (GHS, USD, EUR, GBP, CAD, AUD)
    - IsActive (true or false)
    - IsFeatured (true or false)
    - CreatedAt (current date and time)
    - UpdatedAt (current date and time)
    - ReadTime (in minutes)
    - Views (0)
    - IsPublished (true or false)
    - PublishedAt (current date and time)
    - Author (your name)
    - AuthorImage (your profile picture URL)
    - Tags (at least 3)
    Ensure the data is realistic and varied. Format the output as a JSON array.
    
    ${propertyParser.getFormatInstructions()}
    `;

  console.log("Generating properties...");

  const response = await llm.invoke(prompt);
  return propertyParser.parse(response.text as string);
}

async function createPropertySummary(property: Property): Promise<string> {
  return new Promise((resolve) => {
    const summary = `Property "${property.name}" located in ${
      property.location
    } is a ${property.status} ${property.propertyType} with ${
      property.beds
    } bedrooms and ${property.baths} bathrooms, priced at ${
      property.currency
    } ${property.price}. Key features include: ${property.features.join(
      ", "
    )}. Amenities available: ${property.amenities.join(", ")}.`;
    resolve(summary);
  });
}

export async function seedDatabase() {
  try {
    const { db } = await connectDB();
    console.log("Connected to MongoDB");

    const collection = db.collection("properties");
    await collection.deleteMany({});
    console.log("Cleared existing properties");

    const syntheticProperties = await generateSyntheticProperties();

    const recordsWithSummaries = await Promise.all(
      syntheticProperties.map(async (property) => ({
        pageContent: await createPropertySummary(property),
        metadata: { ...property },
      }))
    );

    for (const record of recordsWithSummaries) {
      await MongoDBAtlasVectorSearch.fromDocuments(
        [record],
        new OpenAIEmbeddings(),
        {
          collection,
          indexName: "property-index",
          textKey: "pageContent",
          embeddingKey: "embedding",
        }
      );

      console.log(`Inserted property: ${record.metadata.name}`);
    }
    console.log("Database seeding completed.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

  seedDatabase().then(() => {
    console.log("Seeding process finished.");
    process.exit(0);
  });
