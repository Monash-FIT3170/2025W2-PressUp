import { Meteor } from "meteor/meteor";
import { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSubscribe } from "meteor/react-meteor-data";
import { Roles } from "meteor/alanning:roles";

interface Comment {
  postedBy: string;
  datePosted: Date;
  content: string;
}

interface CommentProps {
  key?: string;
  comment: Comment;
}

function Comment({ key, comment }: CommentProps) {
  const [user, setUser] = useState<Meteor.User | null>(null);
  const [userRole, setUserRole] = useState("");
  useSubscribe("users.roles")();

  useEffect(() => {
    if (!comment.postedBy) return;

    let isMounted = true;
    Meteor.call(
      "users.getBasicInfo",
      comment.postedBy,
      (err: string, res: Meteor.User) => {
        if (isMounted && !err) {
          setUser(res);
          setUserRole(Roles.getRolesForUser(user)[0]);
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, [comment.postedBy, user]);

  return (
    <div className="w-full p-3 border-y-1 border-gray-300" key={key}>
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <CircleUserRound size={30} />

        {/* Main content */}
        <div className="flex-1">
          {/* Top row: Name + Role + Date */}
          <div className="flex justify-between items-center mb-1">
            <div>
              <p className="text-md font-semibold">
                {user ? user.profile?.firstName : "Unknown"}{" "}
                {user ? user.profile?.lastName : "User"}
              </p>
              <p className="text-sm text-gray-500">
                {userRole
                  ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
                  : "Loading role..."}
              </p>
            </div>

            <div className="text-right text-sm text-gray-400 ml-4">
              <p>
                {new Date(comment.datePosted).toLocaleDateString()},{" "}
                {new Date(comment.datePosted).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                (
                {formatDistanceToNow(new Date(comment.datePosted), {
                  addSuffix: true,
                })}
                )
              </p>
            </div>
          </div>

          {/* Comment content */}
          <p className="mt-2 w-full whitespace-pre-wrap text-gray-700">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Comment;
