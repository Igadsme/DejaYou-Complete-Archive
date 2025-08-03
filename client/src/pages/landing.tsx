import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, History, HeartHandshake, MessageCircle, Shield, UserCheck, Clock, BookOpen } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-lightbg">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-softgray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-coral-sunset rounded-full flex items-center justify-center">
                <Heart className="text-white text-sm" />
              </div>
              <span className="font-handwritten text-2xl font-bold text-coral">DejaYou</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#how-it-works" className="text-darktext hover:text-coral transition-colors">How it Works</a>
              <a href="#safety" className="text-darktext hover:text-coral transition-colors">Safety</a>
              <Button
                onClick={() => window.location.href = '/api/login'}
                className="gradient-coral-sunset text-white px-6 py-2 rounded-full hover:shadow-warm transition-shadow"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-warm"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-handwritten text-5xl md:text-7xl font-bold text-darktext mb-6">
            Not just who you are.<br />
            <span className="text-coral">Who you've been.</span>
          </h1>
          <p className="text-xl md:text-2xl text-darktext/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            DejaYou matches you based on shared lived experiences — the milestones, struggles, and chapters that shaped who you are today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => window.location.href = '/api/login'}
              className="gradient-coral-sunset text-white px-8 py-4 rounded-full text-lg font-medium hover:shadow-warm transition-shadow"
              size="lg"
            >
              Start Your Journey
            </Button>
            <Button
              variant="outline"
              className="border-softgray px-8 py-4 rounded-full text-darktext hover:bg-white transition-colors"
              size="lg"
            >
              <MessageCircle className="mr-2" />
              Watch How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-handwritten text-4xl md:text-5xl font-bold text-darktext mb-4">How DejaYou Works</h2>
            <p className="text-xl text-darktext/70 max-w-2xl mx-auto">Connect through what shaped you, not just what you like</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 gradient-coral-sunset rounded-full flex items-center justify-center mx-auto mb-6 shadow-warm">
                <History className="text-white text-2xl" />
              </div>
              <h3 className="font-handwritten text-2xl font-bold text-darktext mb-4">Build Your History</h3>
              <p className="text-darktext/70 leading-relaxed">Share the moments, challenges, and growth experiences that made you who you are today. From moving away from home to overcoming heartbreak.</p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 gradient-coral-teal rounded-full flex items-center justify-center mx-auto mb-6 shadow-warm">
                <HeartHandshake className="text-white text-2xl" />
              </div>
              <h3 className="font-handwritten text-2xl font-bold text-darktext mb-4">Find Your DejaMatch</h3>
              <p className="text-darktext/70 leading-relaxed">Our algorithm connects you with people who've walked similar paths, creating deeper understanding and emotional resonance.</p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 gradient-sunset-teal rounded-full flex items-center justify-center mx-auto mb-6 shadow-warm">
                <MessageCircle className="text-white text-2xl" />
              </div>
              <h3 className="font-handwritten text-2xl font-bold text-darktext mb-4">Share Your Stories</h3>
              <p className="text-darktext/70 leading-relaxed">Start meaningful conversations based on shared experiences, with thoughtful prompts and emotional consent features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo History Interface */}
      <section className="py-20 bg-gradient-to-b from-lightbg to-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-handwritten text-4xl md:text-5xl font-bold text-darktext mb-4">Your Story Becomes Your Profile</h2>
            <p className="text-xl text-darktext/70">No more surface-level bios. Share your journey instead.</p>
          </div>
          
          {/* History Demo */}
          <Card className="max-w-md mx-auto shadow-warm">
            <CardContent className="p-8">
              {/* Profile Header */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-coral/20 to-teal/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserCheck className="w-12 h-12 text-coral" />
                </div>
                <h3 className="font-handwritten text-2xl font-bold text-darktext mb-1">Maya, 28</h3>
                <p className="text-darktext/70">Brooklyn, NY</p>
              </div>
              
              {/* History */}
              <div className="relative">
                {/* History line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 timeline-line"></div>
                
                {/* History items */}
                <div className="space-y-8">
                  {/* Formative Years */}
                  <div className="relative flex items-start">
                    <div className="w-3 h-3 bg-coral rounded-full border-2 border-white shadow-sm z-10"></div>
                    <div className="ml-6">
                      <div className="bg-coral/10 rounded-xl p-4">
                        <h4 className="font-medium text-darktext mb-2">Formative Years</h4>
                        <p className="text-sm text-darktext/80">"Moved across the country at 18, learned independence the hard way"</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Turning Points */}
                  <div className="relative flex items-start">
                    <div className="w-3 h-3 bg-teal rounded-full border-2 border-white shadow-sm z-10"></div>
                    <div className="ml-6">
                      <div className="bg-teal/10 rounded-xl p-4">
                        <h4 className="font-medium text-darktext mb-2">Turning Points</h4>
                        <p className="text-sm text-darktext/80">"Career pivot at 25 - from corporate to creative"</p>
                        <div className="mt-2 bg-sunset/20 rounded-lg px-3 py-1 text-xs text-darktext/90 inline-block">
                          <Heart className="inline w-3 h-3 text-sunset mr-1" />
                          Tender moment
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Growth */}
                  <div className="relative flex items-start">
                    <div className="w-3 h-3 bg-sunset rounded-full border-2 border-white shadow-sm z-10"></div>
                    <div className="ml-6">
                      <div className="bg-sunset/10 rounded-xl p-4">
                        <h4 className="font-medium text-darktext mb-2">What I'm Growing Into</h4>
                        <p className="text-sm text-darktext/80">"Learning to be vulnerable in relationships"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-softgray">
                <Button variant="ghost" size="icon" className="w-12 h-12 bg-softgray/50 rounded-full text-darktext/60 hover:bg-softgray">
                  ✕
                </Button>
                <Button variant="ghost" size="icon" className="w-12 h-12 bg-sunset/20 rounded-full text-sunset hover:bg-sunset/30">
                  ?
                </Button>
                <Button variant="ghost" size="icon" className="w-12 h-12 bg-coral/20 rounded-full text-coral hover:bg-coral/30">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-center space-x-4 mt-2 text-xs text-darktext/60">
                <span>Pass</span>
                <span>Curious</span>
                <span>Relate</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section id="safety" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-handwritten text-4xl md:text-5xl font-bold text-darktext mb-4">Built for Emotional Safety</h2>
            <p className="text-xl text-darktext/70">We prioritize respect, consent, and thoughtful connections</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left side - Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-coral/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="text-coral" />
                </div>
                <div>
                  <h3 className="font-medium text-darktext mb-2">Emotional Consent Layer</h3>
                  <p className="text-darktext/70">Sensitive stories require permission before viewing, ensuring respectful pacing.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCheck className="text-teal" />
                </div>
                <div>
                  <h3 className="font-medium text-darktext mb-2">Privacy Controls</h3>
                  <p className="text-darktext/70">Your timeline is private until you match, and you control what you share.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sunset/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="text-sunset" />
                </div>
                <div>
                  <h3 className="font-medium text-darktext mb-2">Mental Health Support</h3>
                  <p className="text-darktext/70">Resources and partnerships with wellness platforms for additional support.</p>
                </div>
              </div>
            </div>
            
            {/* Right side - Trust indicators */}
            <div className="bg-gradient-to-br from-coral/5 to-teal/5 rounded-3xl p-8">
              <div className="w-full h-48 bg-gradient-to-r from-coral/20 to-teal/20 rounded-2xl mb-6 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-darktext/30" />
              </div>
              
              <div className="space-y-4">
                {[
                  "Verified profiles only",
                  "24/7 community support", 
                  "AI-powered safety monitoring",
                  "Professional counselor partnerships"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-coral rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-darktext/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-warm">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-handwritten text-4xl md:text-6xl font-bold text-darktext mb-6">
            Ready to find someone who truly gets you?
          </h2>
          <p className="text-xl text-darktext/80 mb-8 max-w-2xl mx-auto">
            Join DejaYou and connect with people who've walked similar paths. Your story is waiting to meet its match.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={() => window.location.href = '/api/login'}
              className="gradient-coral-sunset text-white px-8 py-4 rounded-full text-lg font-medium hover:shadow-warm transition-shadow"
              size="lg"
            >
              Join DejaYou
            </Button>
            <Button
              variant="outline"
              className="border-darktext/30 px-8 py-4 rounded-full text-darktext hover:bg-white/50 transition-colors"
              size="lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-darktext text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 gradient-coral-sunset rounded-full flex items-center justify-center">
                <Heart className="text-white text-sm" />
              </div>
              <span className="font-handwritten text-2xl font-bold text-coral">DejaYou</span>
            </div>
            <p className="text-white/70 mb-4">Connecting hearts through shared stories and lived experiences.</p>
            <p className="text-white/60">&copy; 2024 DejaYou. All rights reserved. Made with ❤️ for meaningful connections.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
