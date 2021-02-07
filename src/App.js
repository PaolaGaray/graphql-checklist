import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';


const GET_TODOS = gql `
    query getTodos {
      todos {
        done
        id
        text
      }
}`;

const TOGGLE_TODO = gql `
  mutation toggleTodo($id: uuid!, $done: Boolean!) {
    update_todos(where: {id: {_eq: $id }}, _set: {done: $done}) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const ADD_TODO = gql `
  mutation addTodo($text: String!) {
    insert_todos(objects: {text: $text}) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const DELETE_TODO = gql `
  mutation deleteTodo($id: uuid!) {
    delete_todos(where: {id: {_eq: $id}}) {
      returning {
        done
        id
        text
      }
    }
  }
`;


function App() {
  const [todoText, setTodoText] = useState('');

  const { data, loading, error } = useQuery(GET_TODOS);
  const [ toggleTodo ] = useMutation(TOGGLE_TODO);
  const [ addtodo ] = useMutation(ADD_TODO, {
    onCompleted: () => setTodoText('')
  });
  const [ deleteTodo ] = useMutation(DELETE_TODO);

  const handleToggleTodo =  async ({ id, done }) => {
    const data = await toggleTodo({ variables: { id: id, done: !done} });
    console.log('toggled todo', data);
  };

  const handleAddTodo = async (event) => {
    event.preventDefault();
    if(!todoText.trim()) return;
    const data = await addtodo({
      variables: { text: todoText },
      refetchQueries: [{ query: GET_TODOS }]
    });
    console.log('addedTodo', data);
    // setTodoText('');
  };

  const handleDeleteTodo = async ( { id }) => {
    const isConfirmed = window.confirm('Do you want to delete this todo?');
    if (isConfirmed){
        const data = await deleteTodo(
          { variables: { id },
          refetchQueries: [{ query: GET_TODOS }]
        });
        console.log('delete todo', data);
    }
  }

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white pa4 fl-1">
      <h1 className="f2-l">
        Paola's Checklist {" "}
        <span role="img" aria-label="Checkmark">
          ✅
        </span>
      </h1>
      <form className="mb3" onSubmit={handleAddTodo}>
        <input
          className="pa2 f4 b--dashed"
          type='text'
          placeholder="Write your todo"
          onChange={event => setTodoText(event.target.value)}
          value={todoText}
        />
        <button
          className="pa2 f4 bg-green"
          type='submit'>
          Create
        </button>
      </form>

      {/* Todolist */}
      <div className="flex items-center justify-center flex-column">
        {data.todos.map(todo => (
          <p key={todo.id} onDoubleClick={() => handleToggleTodo(todo)}>
            <span className={`pointer list pa1 f3 ${todo.done && 'strike'}`} >
              {todo.text}
            </span>
            <button className="bg-transparent bn f4 pointer" onClick={() => handleDeleteTodo(todo)}>
              <span className="red">&times;</span>
            </button>
          </p>
        ))}
      </div>

    </div>
  );
}

export default App;
