'use client'

import { useState } from 'react'
import { Activity, Users, Calendar, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Dynamic Endurance Training Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Build once, assign many. Automatically scale workouts to each athlete's unique fitness markers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<Activity className="w-8 h-8" />}
            title="VDOT Scaling"
            description="Running workouts automatically adjust based on athlete VDOT"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="FTP Scaling"
            description="Cycling workouts scale to Functional Threshold Power"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Bulk Assignment"
            description="Assign 12-week plans to 50+ athletes simultaneously"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Smart Calendar"
            description="Resolved workouts with absolute targets for each athlete"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4">
            <Step number={1} title="Coach Creates Template">
              Input workouts in natural language: "Warmup - 10m 60% FTP, Main Set 5x - 800m 105% VDOT-Pace"
            </Step>
            <Step number={2} title="Dynamic Engine Resolves">
              System converts relative targets to absolute values based on each athlete's VDOT/FTP
            </Step>
            <Step number={3} title="Assign to Athletes">
              Bulk assign to multiple athletes - each gets personalized targets automatically
            </Step>
            <Step number={4} title="Track & Adapt">
              Monitor completion, log PAIRS data, and adjust FTP based on performance
            </Step>
          </div>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function Step({ number, title, children }: { number: number, title: string, children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-gray-600">{children}</p>
      </div>
    </div>
  )
}
