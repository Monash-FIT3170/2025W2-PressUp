import React, { useEffect, useState } from "react";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

export const Loading: React.FC = () => (
  <div className="p-8 text-center text-red-900 font-bold">Loading…</div>
);

export const AccessDenied: React.FC = () => (
  <div className="p-8 text-center text-red-900 font-bold">
    Access denied. You do not have permission to view this page.
  </div>
);

export const RequireRole: React.FC<{
  anyOf: string[];
  children: React.ReactNode;
}> = ({ anyOf, children }) => {
  const loggingIn = useTracker(() => Meteor.loggingIn());
  const userId = useTracker(() => Meteor.userId());
  const subReady = useSubscribe("roleAssignments.mine")();
  const ready = !!userId && subReady;
  const [everReady, setEverReady] = useState(false);
  useEffect(() => {
    if (ready && !everReady) setEverReady(true);
  }, [ready, everReady]);

  const hasRole = useTracker(() => {
    console.log("hasRole", userId, ready);
    if (!userId) return false;
    const assigned = new Set<string>();
    Meteor.roleAssignment
      .find({ "user._id": userId })
      .forEach((a) => {
        const roleName = a.role?._id as string | undefined;
        if (roleName) assigned.add(roleName);
      });
    return anyOf.some((r) => assigned.has(r));
  }, [anyOf, userId]);

  if (loggingIn || (!everReady && !ready)) return <Loading />;

  if (!hasRole) return <AccessDenied />;
  return <>{children}</>;
};


