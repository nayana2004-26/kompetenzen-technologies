
import React, { useState, useEffect } from "react";

import {
    createItem,
    updateItem,
    deleteItem,
    fetchItems
} from "./CruApp";

import "./CrudApp.css";

const Crud = () => {
    const [items, setItems] = useState([]);
    const [text, setText] = useState("");
    const [edit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    // READ
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await fetchItems();
            console.log(data);
            setItems(data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    // INPUT CHANGE
    const handleInputChange = (e) => {
        setText(e.target.value);
    };

    // CREATE
    const handleAddItem = async () => {
        if (text.trim() === "") {
            return;
        }

        try {
            const newItem = await createItem(text);

            // Give each locally added item a unique ID
            const itemToAdd = {
                ...newItem,
                id: Date.now(),
                title: text
            };

            setItems([...items, itemToAdd]);
            setText("");
        } catch (error) {
            console.log("Error adding item:", error);
        }
    };

    // SELECT ITEM FOR EDITING
    const handleEditItem = (item) => {
        setText(item.title);
        setEdit(true);
        setEditId(item.id);
    };

    // UPDATE AND SAVE
    const handleSaveItem = async (id, newText) => {
        if (newText.trim() === "") {
            return;
        }

        try {
            const updatedItem = await updateItem(id, newText);

            const updatedItems = items.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        ...updatedItem,
                        id: item.id,
                        title: newText
                    }
                    : item
            );

            setItems(updatedItems);
            setText("");
            setEdit(false);
            setEditId(null);
        } catch (error) {
            console.log("Error updating item:", error);
        }
    };

    // DELETE
    const handleDeleteItem = async (id) => {
        try {
            await deleteItem(id);

            const filteredItems = items.filter(
                (item) => item.id !== id
            );

            setItems(filteredItems);

            if (editId === id) {
                setText("");
                setEdit(false);
                setEditId(null);
            }
        } catch (error) {
            console.log("Error deleting item:", error);
        }
    };

    // CANCEL EDITING
    const handleCancelEdit = () => {
        setText("");
        setEdit(false);
        setEditId(null);
    };

    return (
        <div className="crud-container">
            <h1>CRUD App</h1>

            <div className="input-container">
                <input
                    type="text"
                    value={text}
                    onChange={handleInputChange}
                    placeholder="Enter a task"
                />

                {edit ? (
                    <>
                        <button
                            onClick={() =>
                                handleSaveItem(editId, text)
                            }
                        >
                            Save
                        </button>

                        <button onClick={handleCancelEdit}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <button onClick={handleAddItem}>
                        Add Item
                    </button>
                )}
            </div>

            <ul className="task-list">
                {items.map((item) => (
                    <li
                        key={item.id}
                        className="task-item"
                    >
                        <span>{item.title}</span>

                        <button
                            onClick={() => handleEditItem(item)}
                        >
                            Edit
                        </button>

                        <button
                            onClick={() =>
                                handleDeleteItem(item.id)
                            }
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Crud;
