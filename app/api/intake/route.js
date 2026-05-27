import { GoogleGenerativeAI } from '@google/generative-ai';
import { Resend } from 'resend';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.json(); 
    
    const prompt = `
      You are the lead franchise consultant at JMW Consulting. Your objective is to review raw intake data from prospective franchise buyers and generate a rapid "Viability & Scope Summary." 
      
      Step 1: Evaluate Viability & Flag Risks
      Analyze the prospect's inputs. You must brutally assess the alignment between their Capital, Role, and Timeline. 
      - Rule: If Role = "Semi-Absentee" or "Passive Investor" and Capital is under $100k, generate a RED FLAG indicating severe undercapitalization for management-run models.
      - Rule: If Timeline = "< 3 months" and FDD Received = "No", generate a YELLOW FLAG indicating an unrealistic timeline.
      
      Step 2: Define the Consulting Scope
      Based on their selections, output a recommended statement of work.
      - Rule: If Business Type = "Brick & Mortar", prioritize "Site Selection Analysis" and "Financial Viability" to model lease economics.
      - Rule: If Partners = "Yes", mandate the "Operational Assessment" to define the Workstream Model.

      Output Format:
      1. Prospect Snapshot: (2-sentence summary of who they are and what they want).
      2. Risk Assessment: (Bullet points of Red/Yellow/Green flags based on the rules above).
      3. Recommended SOW (Statement of Work): (The specific JMW services they need, mapped to their goals).

      =========================================
      HERE IS THE PROSPECT'S RAW INTAKE DATA:
      Liquid Capital: ${formData.liquidCapital}
      Net Worth: ${formData.netWorth}
      Role: ${formData.role}
      Timeline: ${formData.timeline}
      FDD Received: ${formData.fdd}
      Business Type: ${formData.businessType}
      Partners: ${formData.partners}
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    await resend.emails.send({
      from: 'JMW Automated Dispatch <onboarding@resend.dev>',
      to: 'jason.wright09@gmail.com', // <--- CHANGE THIS TO YOUR ACTUAL EMAIL
      subject: `🚨 New Franchise Lead Scored: ${formData.role} (${formData.liquidCapital})`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2563eb;">JMW Consulting: New Lead Briefing</h2>
          <p>A new prospect has run through the Intake Parser. Here is the AI-generated viability breakdown.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Raw Data Snapshot:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Capital:</strong> ${formData.liquidCapital}</li>
              <li><strong>Net Worth:</strong> ${formData.netWorth}</li>
              <li><strong>Role:</strong> ${formData.role}</li>
              <li><strong>Timeline:</strong> ${formData.timeline}</li>
              <li><strong>FDD Received:</strong> ${formData.fdd}</li>
            </ul>
          </div>

          <h3>AI Viability & Scope Analysis:</h3>
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; white-space: pre-wrap; line-height: 1.6;">
            ${responseText}
          </div>
        </div>
      `
    });

    return new Response(JSON.stringify({ analysis: responseText }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}