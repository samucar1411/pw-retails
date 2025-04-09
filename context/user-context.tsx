"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";

import { userService } from "@/services/user-service";

import { User, UserCreateInput } from "@/types/user";

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

type UserAction =
  | { type: "FETCH_USERS_START" }
  | { type: "FETCH_USERS_SUCCESS"; payload: User[] }
  | { type: "FETCH_USERS_ERROR"; payload: string }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: number };

interface UserContextType {
  state: UserState;
  fetchUsers: () => Promise<void>;
  addUser: (user: UserCreateInput) => Promise<void>;
  updateUser: (id: number, user: Partial<User>) => Promise<User | null>;
  deleteUser: (id: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case "FETCH_USERS_START":
      return { ...state, loading: true, error: null };
    case "FETCH_USERS_SUCCESS":
      return { ...state, loading: false, users: action.payload };
    case "FETCH_USERS_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] };
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      };
    default:
      return state;
  }
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, {
    users: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = useCallback(async () => {
    dispatch({ type: "FETCH_USERS_START" });
    try {
      const data = await userService.getUsers();
      dispatch({ type: "FETCH_USERS_SUCCESS", payload: data });
    } catch (error) {
      dispatch({ type: "FETCH_USERS_ERROR", payload: "Error fetching users" });
    }
  }, []);

  const addUser = useCallback(async (userData: UserCreateInput) => {
    try {
      const newUser = await userService.createUser(userData);
      if (newUser) {
        dispatch({ type: "ADD_USER", payload: newUser });
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  }, []);

  const updateUser = useCallback(async (id: number, user: Partial<User>) => {
    try {
      const updatedUser = await userService.updateUser(id, user);
      if (updatedUser) {
        dispatch({ type: "UPDATE_USER", payload: updatedUser });
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    try {
      await userService.deleteUser(id);
      dispatch({ type: "DELETE_USER", payload: id });
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ state, fetchUsers, addUser, updateUser, deleteUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}
