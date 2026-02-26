import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-signature") || "";

        if (!process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
            throw new Error('LEMON_SQUEEZY_WEBHOOK_SECRET is required');
        }

        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(body).digest('hex'), 'utf8');
        const signatureBuffer = Buffer.from(signature, 'utf8');

        if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
            return new NextResponse('Invalid signature', { status: 401 });
        }

        const payload = JSON.parse(body);
        const eventName = payload.meta.event_name;
        const customData = payload.meta.custom_data;
        const userId = customData?.user_id; // Pass this in your checkout link as custom_data: { user_id: 'uuid' }

        switch (eventName) {
            case 'subscription_created': {
                // New subscription — always grant Pro
                if (userId) {
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            is_pro: true,
                            lemon_customer_id: payload.data.attributes.customer_id.toString(),
                            lemon_subscription_id: payload.data.id.toString(),
                        })
                        .eq('id', userId);
                }
                break;
            }
            case 'subscription_updated':
            case 'subscription_resumed': {
                // Status can be: active, cancelled, expired, paused, unpaid, past_due, trialing
                const status = payload.data.attributes.status as string;
                const subscriptionId = payload.data.id.toString();
                const isActive = status === 'active' || status === 'trialing';

                if (isActive && userId) {
                    // Ensure profile is updated with latest IDs when active
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            is_pro: true,
                            lemon_customer_id: payload.data.attributes.customer_id.toString(),
                            lemon_subscription_id: subscriptionId,
                        })
                        .eq('id', userId);
                } else if (!isActive) {
                    // Cancelled, paused, unpaid, expired — revoke Pro immediately
                    await supabaseAdmin
                        .from('profiles')
                        .update({ is_pro: false })
                        .eq('lemon_subscription_id', subscriptionId);
                }
                break;
            }
            case 'subscription_cancelled':
            case 'subscription_expired':
            case 'subscription_paused': {
                // Hard revoke regardless of anything else
                const subscriptionId = payload.data.id.toString();
                await supabaseAdmin
                    .from('profiles')
                    .update({ is_pro: false })
                    .eq('lemon_subscription_id', subscriptionId);
                break;
            }
            default:
                break;
        }

        return new NextResponse('Webhook processed successfully', { status: 200 });
    } catch (err: any) {
        console.error('Webhook Error:', err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }
}
