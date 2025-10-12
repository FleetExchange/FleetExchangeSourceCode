import { EmailTemplate } from "@/components/EmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <admin@fleetexchange.co.za>",
      to: ["wietske3010@icloud.com"],
      subject: "Hello world",
      react: EmailTemplate({ firstName: "Wietske" }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data.id);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
