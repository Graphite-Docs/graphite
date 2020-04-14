export const URL = process.env.NODE_ENV === "production" ? "someurl" : "http://localhost:5000";
export const config = {
  headers: {
    "Content-Type": "application/json",
  },
};