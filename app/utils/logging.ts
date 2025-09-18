import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface PagingData {
  belt_no: string;
  flight_no: string;
  name_passenger: string;
  handle_by: string;
  free_text: string;
  status: number;
}

export async function logPagingOperation(data: PagingData) {
  try {
    console.log("Attempting to create log entry with data:", data);
    
    // Try to create log entry using direct SQL if model is not recognized
    const logEntry = await prisma.$executeRaw`
      INSERT INTO tb_paging_log (belt_no, flight_no, name_passenger, handle_by, free_text, status, created_at, updated_at)
      VALUES (${data.belt_no}, ${data.flight_no}, ${data.name_passenger}, ${data.handle_by}, ${data.free_text}, ${data.status}, NOW(), NOW())
    `;
    
    console.log("Log entry created successfully:", logEntry);
    return logEntry;
  } catch (error) {
    console.error("Error logging paging operation:", error);
    
    // Try alternative method with type assertion
    try {
      console.log("Trying alternative method...");
      const logEntry = await (prisma as any).tb_paging_log.create({
        data: {
          belt_no: data.belt_no,
          flight_no: data.flight_no,
          name_passenger: data.name_passenger,
          handle_by: data.handle_by,
          free_text: data.free_text,
          status: data.status
        }
      });
      console.log("Alternative method successful:", logEntry);
      return logEntry;
    } catch (altError) {
      console.error("Alternative method also failed:", altError);
    }
    
    // Don't throw error to prevent main operation from failing
  }
}
