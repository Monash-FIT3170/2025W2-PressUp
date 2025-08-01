import { Meteor } from "meteor/meteor";
import { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { LoginInput } from "../components/interaction/LoginInput";
import { BigLogo } from "../components/symbols/BigLogo";
import { Button } from "../components/interaction/Button";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/";

  // Logged in check
  if (Meteor.userId() !== null) return <Navigate replace to={from} />;

  const onSubmitLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <main className="bg-press-up-purple flex flex-1 overflow-hidden items-center justify-center">
      <form className="w-full md:w-1/4 p-4" onSubmit={onSubmitLogin}>
        {/* This centers the inputs on the screen */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="absolute bottom-full mb-8">
            <div className="bg-white py-4">
              <BigLogo size={300} />
            </div>
          </div>

          <LoginInput
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            required
          />

          <LoginInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
          />

          <div className="w-1/2">
            <Button type="submit">Log In</Button>
          </div>
        </div>
      </form>
    </main>
  );
};
