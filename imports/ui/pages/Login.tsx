import { Meteor } from "meteor/meteor";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Input } from "../components/interaction/Input";
import { BigLogo } from "../components/symbols/BigLogo";
import { Button } from "../components/interaction/Button";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/";

  // Logged in check
  if (Meteor.userId() !== null) return <Navigate replace to={from} />;

  const onSubmitLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    Meteor.loginWithPassword(username, password, (err) => {
      if (err) {
        console.error(err);
        setError("Invalid username or password.");
      } else {
        navigate(from, { replace: true });
      }
    });
  };

  const onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) setError(null);
  };
  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
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

          <Input
            type="text"
            variant="navy"
            value={username}
            onChange={onChangeUsername}
            placeholder="Username"
            autoComplete="username"
            required
          />

          <Input
            type="password"
            variant="navy"
            value={password}
            onChange={onChangePassword}
            placeholder="Password"
            autoComplete="current-password"
            required
          />

          {error && (
            <div role="alert" className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="w-1/2">
            <Button type="submit" width="full">
              Log In
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
};
