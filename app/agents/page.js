import { Suspense } from 'react';
import Link from 'next/link';
import connectDB from '../lib/mongodb';
import User from '../models/User';
export const dynamic = 'force-dynamic';

// async function getAgents() {
//   try {
//     const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
//     const res = await fetch(`${apiUrl}/api/agents`, {
//       next: { revalidate: 60 } // Revalidate every minute
//     });
    
//     if (!res.ok) {
//       throw new Error('Failed to fetch agents');
//     }
//     const data = await res.json();
//     console.log(data)
//     // return res.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching agents:', error);
//     return {
//       agents: [],
//       total: 0
//     };
//   }
// }

export const metadata = {
  title: 'סוכני נדל"ן | פלטפורמת נדל"ן',
  description: 'צפה ברשימת סוכני הנדל"ן המובילים שלנו.',
};

function AgentCard({ agent }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center">
          <img
            src={agent?.profileImage?.secure_url || '/default-avatar.png'}
            alt={agent.fullName}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div className="mr-4">
            <h3 className="text-lg font-semibold text-gray-900">{agent.fullName}</h3>
            <p className="text-sm text-gray-500">{agent.email}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-600 line-clamp-2">{agent.bio}</p>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {agent.properties?.length || 0} נכסים
          </div>
          <Link
            href={`/agents/${agent.slug}`}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            צפה בפרופיל
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function AgentsPage() {
  try {
    await connectDB();
    const agents = await User.find();
    console.log(agents)
    if (!agents) {
      throw new Error('אין סוכנים');
    }
    // const agents = await res.json();
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">סוכני נדל"ן</h1>
            <p className="mt-4 text-xl text-gray-600">
              הכירו את סוכני הנדל"ן המקצועיים שלנו
            </p>
          </div>

          {/* <div className="mb-4 text-gray-600">
            נמצאו {total} סוכנים
          </div> */}

          <Suspense fallback={<div>טוען סוכנים...</div>}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {agents?.map((agent) => (
                <AgentCard key={agent._id} agent={agent} />
              ))}
            </div>
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in AgentsPage:', error);
    return (
      <div className="text-center py-8 text-red-600">
        שגיאה בטעינת הסוכנים. אנא נסה שוב מאוחר יותר.
      </div>
    );
  }
} 