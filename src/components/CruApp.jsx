
import axios from "axios";

// Service Class => CrudAppService
const API_BASE_URL =
    "https://jsonplaceholder.typicode.com/todos";

// READ
export const fetchItems = async () => {
    const response = await axios.get(API_BASE_URL);
    console.log(response);
    return response.data;
};

// CREATE
export const createItem = async (text) => {
    const response = await axios.post(API_BASE_URL, {
        title: text,
        completed: false,
        userId: 1
    });

    console.log(response);
    return response.data;
};

// UPDATE
export const updateItem = async (id, newText) => {
    const response = await axios.put(
        `${API_BASE_URL}/${id}`,
        {
            title: newText
        }
    );

    console.log(response.data);
    return response.data;
};

// DELETE
export const deleteItem = async (id) => {
    const response = await axios.delete(
        `${API_BASE_URL}/${id}`
    );

    console.log(response.data);
    return response.data;
};
