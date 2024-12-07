import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://postgresql.memcoin.stepzen.net/api/memecoin/__graphql', // Removed extra quote
  headers: {
    Authorization: `Apikey ${process.env.NEXT_PUBLIC_STEPZEN_KEY}`,
  },
  cache: new InMemoryCache(),
});

export default client;
