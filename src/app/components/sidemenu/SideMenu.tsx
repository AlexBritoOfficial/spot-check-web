"use client";

import { SubmitEvent } from "react";
import styles from "./SideMenu.module.css";
import CloseButton from "../button/closebutton/CloseButton.component";
import Button from "../button/Button.component";
import { useSession } from "@/app/lib/useSession";
import { useSignIn } from "@/app/lib/useSignIn";
import { useSignOut } from "@/app/lib/useSignOut";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignUp: () => void;
}

function SideMenu({ isOpen, onClose, onOpenSignUp }: SideMenuProps) {
  const { data: session } = useSession();
  const signIn = useSignIn();
  const signOut = useSignOut();
  const signedIn = session != null;

  function handleSignIn(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    signIn.mutate({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  }

  return (
    <nav className={`${styles.root} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.firstrow}>
        <div className={styles.title}>
          <span className={styles.white}>SPOT</span>
          <span className={styles.gold}>CHECK</span>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      {signedIn ? (
        <div className={styles.body}>
          <div className={styles.profileRow}>
            <div className={styles.avatar}>
              {(session.username ?? session.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.name}>
                {session.username ?? session.email}
              </div>
              {session.username && (
                <div className={styles.handle}>@{session.username}</div>
              )}
            </div>
          </div>

          <div className={styles.navList}>
            <button className={styles.navItem}>My profile</button>
            <button className={styles.navItem}>Bookmarks</button>
            <button className={styles.navItem}>Notifications</button>
            <button className={styles.navItem}>Settings</button>
            <button
              className={`${styles.navItem} ${styles.signOut}`}
              onClick={() => signOut.mutate()}
              disabled={signOut.isPending}
            >
              {signOut.isPending ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      ) : (
        <form className={styles.body} onSubmit={handleSignIn}>
          <p className={styles.introText}>
            Sign in to add spots, save your favorites, and post reviews.
          </p>

          <div className={styles.formGroup}>
            <label htmlFor="signin-email" className={styles.label}>
              Email
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signin-password" className={styles.label}>
              Password
            </label>
            <input
              id="signin-password"
              name="password"
              type="password"
              placeholder="••••••••"
              className={styles.input}
              required
            />
          </div>

          {signIn.error && (
            <p className={styles.errorMessage}>{signIn.error.message}</p>
          )}

          <Button
            label={signIn.isPending ? "Signing in..." : "Sign in"}
            variant="primary"
            type="submit"
          />

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            OR
            <span className={styles.dividerLine} />
          </div>

          <Button
            label="Continue with Google"
            variant="outline"
            type="button"
          />

          <p className={styles.switchText}>
            New here?{" "}
            <span className={styles.switchLink} onClick={onOpenSignUp}>
              Create an account
            </span>
          </p>
        </form>
      )}
    </nav>
  );
}

export default SideMenu;
