import { Meteor } from "meteor/meteor";
import { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

  useEffect(() => {
    if (!post.postedBy) return;

    let isMounted = true;
    Meteor.call(
      "users.getBasicInfo",
      post.postedBy,
      (err: string, res: any) => {
        if (isMounted && !err) {
          setUser(res);
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, [post.postedBy]);

  return (
    <div>
      <h1 className="text-5xl mb-4 w-full">{post.subject}</h1>
      <div className="flex items-center space-x-4 mb-6">
        <CircleUserRound size={80} />
        <div className="flex flex-col">
          <p className="text-md font-semibold mb-2">
            {user ? user.profile?.firstName : "Loading..."}{" "}
            {user ? user.profile?.lastName : "Loading..."}
          </p>
          <p className="text-md font-semibold">
            {user ? user.username : "Loading..."}
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
