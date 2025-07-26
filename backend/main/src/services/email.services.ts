import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your Gmail App Password (16-char)
  },
});

//to send email to the customers
export function createDeliveryEmailTemplate(
  customerName: string,
  deliveryId: string,
  deliveryDetails: {
    dropoff_location: string;
    priority: number;
    weight: number;
    size: string;
  }
): string {
  // <li>
  //   <strong>Size:</strong> ${deliveryDetails.size}
  // </li>;
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${customerName},</h2>
  
        <p>We are writing to inform you that you have a delivery scheduled to arrive in <strong>2 days</strong> as part of our service at <strong>Margadarshi</strong>.</p>
  
        <h3>Delivery Details:</h3>
        <ul>
          <li><strong>Dropoff Location:</strong> ${deliveryDetails.dropoff_location}</li>
          <li><strong>Priority:</strong> ${deliveryDetails.priority}</li>
          <li><strong>Weight:</strong> ${deliveryDetails.weight} kg</li>
          
        </ul>
  
        <p>To help us serve you better, please select your preferred delivery time slot by clicking the button below:</p>
  
        <div style="margin: 30px 0;">
          <a href="http://localhost:3000/time-slot/${deliveryId}" 
            style="background-color: #007bff; color: white; padding: 12px 24px; 
                   text-decoration: none; border-radius: 5px; display: inline-block;">
            Choose Time Slot
          </a>
        </div>
  
        <p>If no time slot is selected, we will attempt delivery within a standard window.</p>
  
        <p>Thank you,<br/>Team Margadarshi</p>
      </div>
    `;
}
