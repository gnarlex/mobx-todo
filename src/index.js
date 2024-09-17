import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {makeObservable, observable, action, when, computed, flow} from 'mobx';
import {observer} from "mobx-react-lite";
import {apiUrl} from "./utils";


class Todo {
    done = false;

    constructor(id, title) {
        this.id = id;
        this.title = title;
        makeObservable(this, {
            title: observable,
            done: observable,
            toggle: action,
        });
    }

    toggle() {
        this.done = !this.done;
    }
}
const LeTodo = observer(({todo}) => {
    console.log(`Rendering todo "${todo.title}"`);
    return (
        <li>
            <input
                type="checkbox"
                checked={todo.done}
                onChange={() => todo.toggle()}
            />
            {todo.title}
        </li>
    );
});

class TodoList {
    get finishedCount() {
        return this.todos
            .filter(todo => todo.done)
            .length;
    }

    constructor(todos = []) {
        this.todos = todos;
        makeObservable(this, {
            todos: observable,
            add: flow,
            finishedCount: computed,
        });
    }

    *add(title) {
        try {
            const res = yield fetch(`${apiUrl}/todos`, {
                method: 'POST',
                body: JSON.stringify({title}),
            });
            if (!res.ok) {
                throw new Error(res.statusText);
            }
            const {id} = yield res.json();
            this.todos.push(new Todo(id, title));
        } catch (e) {
            console.error(`Failed to add todo ${title}: ${e})`);
        }
    }
}

const todos = new TodoList([
    new Todo(1, 'get coffee'),
    new Todo(2, 'write simpler code'),
    new Todo(3, 'go home'),
]);

const LeTodoList = observer(() => (
    <ul style={{listStyleType: 'none'}}>
        {todos.todos.map(todo => (
            <LeTodo todo={todo} key={todo.id} />
        ))}
    </ul>
));

const AddInput = () => {
    const [value, setValue] = useState('');
    return (
        <div>
            <input
                type="text"
                value={value}
                placeholder={'walk the cat...'}
                onChange={e => setValue(e.target.value)}
            />
            <button onClick={() => {
                todos.add(value);
                setValue('');
            }}>
                add
            </button>
        </div>
    );
}

when(
    () => {
        console.log('Checking if we are done...');
        return todos.finishedCount >= 5
    },
    () => alert("You've done enough!"));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <>
        <LeTodoList />
        <AddInput />
    </>
);
