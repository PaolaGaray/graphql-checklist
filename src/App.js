import React from 'react';
import { useQuery, gql } from '@apollo/client';


const GET_TODOS = gql `
    query getTodos {
      todos {
        done
        id
        text
      }
}`;


function App() {

  const { data, loading, error } = useQuery(GET_TODOS);

  if(loading) return <div>loading...</div>
  if(error) return <div>error fetchin todos!</div>

  return (
    <div>
      {data.todos.map(todo => (
        <p key={todo.id}>
          <span>
            {todo.text}
          </span>
        </p>
      ))}
    </div>
  );
}

export default App;
