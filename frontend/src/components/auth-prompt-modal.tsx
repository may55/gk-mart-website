import { Link } from "@tanstack/react-router";
import { LogIn } from "lucide-react";

interface AuthPromptModalProps {
  title: string;
  description: string;
}

export function AuthPromptModal({ title, description }: AuthPromptModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-xl bg-background shadow-lg">
        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            {/* Signup Button (Primary) */}
            <Link
              to="/signup"
              className="block w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md transition-all hover:bg-primary/90 active:scale-95 text-center"
            >
              Sign Up
            </Link>

            {/* Login Button (Secondary) */}
            <Link
              to="/login"
              className="block w-full py-3 border border-input text-foreground font-semibold rounded-md transition-colors hover:bg-muted text-center"
            >
              Login
            </Link>

            {/* Close Button */}
            <p className="text-xs text-muted-foreground">You can browse without signing up</p>
          </div>
        </div>
      </div>
    </div>
  );
}
