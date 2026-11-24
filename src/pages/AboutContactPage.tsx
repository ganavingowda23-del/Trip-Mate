import { CheckCircle2, Compass, Globe, Mail, Send, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

export function AboutContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setErrorMsg('Please enter your name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (trimmedSubject.length < 2) {
      setErrorMsg('Please enter a brief subject.');
      return;
    }
    if (trimmedMessage.length < 10) {
      setErrorMsg('Please write a message of at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: trimmedSubject,
          message: trimmedMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not send your message. Please check your entries.');
        return;
      }
      setSubmittedRef(data.referenceId || 'SENT');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setErrorMsg('Network error while submitting the contact form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
      <div className="bg-[#0B1F3A] text-white py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance mb-3">
            About TripMate
          </h1>
          <p className="text-slate-300 text-base max-w-2xl">
            Your Journey, Your Way. Built to replace fragmented spreadsheets and endless browser tabs with calm, practical trip planning.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Purpose */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-7">
          <div className="bg-white border border-slate-200 rounded-2xl p-7">
            <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/15 text-[#0284C7] flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-lg font-semibold text-[#0B1F3A] mb-2">
              Tailored to your pace
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every traveller balances culture, rest, and adventure differently. TripMate generates flexible day-by-day plans you can edit line by line.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-7">
            <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/15 text-[#0284C7] flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-lg font-semibold text-[#0B1F3A] mb-2">
              Honest budget guidance
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our calculator separates approximate transport, lodging, dining, and activity expenses so you can plan confidently without surprises.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-7">
            <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/15 text-[#0284C7] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-lg font-semibold text-[#0B1F3A] mb-2">
              Private saved trips
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Save plans immediately in your browser or sign in with Google to sync your itineraries securely to your personal Firestore database.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white border border-slate-200 rounded-2xl p-6 sm:p-10"
        >
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-[#0284C7]">
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>Contact TripMate</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0B1F3A] tracking-tight">
              Have a question or destination suggestion?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Whether you have feedback on an itinerary, want to suggest a new destination guide, or need help with saved trips, send us a note.
            </p>
            <div className="pt-4 border-t border-slate-100 text-sm text-slate-600 space-y-2">
              <p>
                <span className="font-semibold text-[#0B1F3A]">Support hours:</span> Mon – Fri, 9:00 AM – 6:00 PM UTC
              </p>
              <p>
                <span className="font-semibold text-[#0B1F3A]">Quick links:</span>{' '}
                <Link to="/planner" className="text-[#0284C7] hover:underline">
                  AI Trip Planner
                </Link>{' '}
                ·{' '}
                <Link to="/assistant" className="text-[#0284C7] hover:underline">
                  Travel Assistant
                </Link>
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {submittedRef ? (
              <div className="bg-[#F8FAFC] border border-emerald-200 rounded-xl p-6 sm:p-8">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold text-[#0B1F3A] mb-2">
                  Message received
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Thank you for writing to TripMate. Your reference ID is{' '}
                  <span className="font-mono font-semibold text-[#0B1F3A]">{submittedRef}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedRef(null)}
                  className="px-4 py-2 rounded-lg bg-[#0B1F3A] text-white text-sm font-medium hover:bg-[#153159] transition-colors cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {errorMsg && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0B1F3A] focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0B1F3A] focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Destination request or feedback"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0B1F3A] focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-[#0B1F3A] mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help with your upcoming journey..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0B1F3A] focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0B1F3A] text-white text-sm font-semibold hover:bg-[#153159] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
