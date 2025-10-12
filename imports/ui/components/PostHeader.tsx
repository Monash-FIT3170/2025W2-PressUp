import { Meteor } from "meteor/meteor";
import { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSubscribe } from "meteor/react-meteor-data";
import { Roles } from "meteor/alanning:roles";
import { Loading } from "../components/Loading";

type Post = {
  postedBy: string;
  datePosted: Date;
  subject: string;
  content: string;
  category: string; // TODO: 5.3 to implement this functionality
};

interface PostHeaderProps {
  post: Post;
}

function PostHeader({ post }: PostHeaderProps) {
  const [user, setUser] = useState<Meteor.User | null>(null);
  const [userRole, setUserRole] = useState("");
  useSubscribe("users.roles")();

  useEffect(() => {
    if (!post.postedBy) return;

    let isMounted = true;
    Meteor.call(
      "users.getBasicInfo",
      post.postedBy,
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
  }, [post.postedBy, user]);

  return (
    <div>
      <h1 className="text-4xl mb-4 w-full">{post.subject}</h1>
      <div className="flex items-center space-x-4 mb-6">
        <CircleUserRound size={80} />
        <div className="flex flex-col">
          <p className="text-md font-semibold mb-2">
            {user ? user.profile?.firstName : "Unknown"}{" "}
            {user ? user.profile?.lastName : "User"}
          </p>
          <p className="text-md font-semibold">
            {userRole ? (
              userRole.charAt(0).toUpperCase() + userRole.slice(1)
            ) : (
              <Loading />
            )}
          </p>
        </div>
        <div className="text-sm text-gray-400 ml-auto">
          <p>
            {new Date(post.datePosted).toLocaleDateString()},{" "}
            {new Date(post.datePosted).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p>
            {"("}
            {formatDistanceToNow(new Date(post.datePosted), {
              addSuffix: true,
            })}
            {")"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PostHeader;
