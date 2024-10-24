import {supabase} from "./supabase"; 

export const getAllTodos = async() => {
    const todos = await supabase.from("todo").select("*");
    return todos.data;
};

export const AddTodos = async(title: string) =>{
    await supabase.from("todo").insert({title : title});
};

export const DeleteTodos = async(id: number) =>{
    await supabase.from("todo").delete().eq("id", id);
};