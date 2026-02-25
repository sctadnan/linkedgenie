import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Terms of Service - LinkedGenie',
    description: 'Terms of Service and User Agreement for LinkedGenie.',
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full bg-white shadow rounded-lg p-8">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-500">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Terms of Service</h1>
                <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-indigo max-w-none text-gray-700 space-y-6">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using LinkedGenie ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">2. Description of Service</h2>
                        <p>
                            LinkedGenie provides AI-powered tools designed to help users generate and optimize LinkedIn content. The Service is provided "as is" and "as available".
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">3. User Accounts</h2>
                        <p>
                            To use certain features of the Service, you must register for an account using Google Authentication. You are responsible for maintaining the confidentiality of your account information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">4. User Generated Content</h2>
                        <p>
                            You retain all rights to any text, images, or other content that you submit, post, or display on or through the Service. By submitting content to LinkedGenie for AI processing, you grant us a license to process that content solely for the purpose of providing you the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">5. Acceptable Use</h2>
                        <p>
                            You agree not to use the Service strictly for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You may not use the Service to generate prohibited content.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">6. Third-Party Services</h2>
                        <p>
                            LinkedGenie utilizes third-party APIs (including OpenAI and Supabase). Your use of LinkedGenie is also subject to the terms of these third-party providers. We do not control and are not responsible for LinkedIn's platforms or policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">7. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms from time to time at our sole discretion. We will notify you of any material changes via email or notice on the site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900">8. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at sct.adnan@gmail.com.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
