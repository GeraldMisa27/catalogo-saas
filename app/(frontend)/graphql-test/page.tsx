async function testGraphQL() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/graphql`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
          Businesses {
            docs {
              id
              name
              slug
            }
          }
        }`,
      }),
    }
  );
  return res.json();
}

export default async function GraphQLTestPage() {
  const data = await testGraphQL();

  return (
    <main className="px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-4">
        Test GraphQL
      </h1>
      <pre className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-auto text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}