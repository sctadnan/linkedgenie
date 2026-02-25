import { Resend } from 'resend';

export async function POST(req: Request) {
    if (!process.env.RESEND_API_KEY || !process.env.DEV_EMAIL) {
        return new Response(JSON.stringify({ error: "Email service not configured." }), { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { name, email, message } = await req.json();

        const data = await resend.emails.send({
            from: 'LinkedGenie Contact <onboarding@resend.dev>',
            to: process.env.DEV_EMAIL,
            subject: `New Feedback/Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });

        return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
