const isProduction = process.env.NODE_ENV === "production"

export const clientOrigin = isProduction
  ? "https://mentor-lagbe-one.vercel.app"
  : "http://localhost:3000"

export const apiOrigin = isProduction
  ? "https://mentor-lagbe-server-nine.vercel.app"
  : "http://localhost:5000"
