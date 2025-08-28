import { Meteor } from "meteor/meteor";
import { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";

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
    let isMounted = true;
    Meteor.users.findOneAsync(post.postedBy).then((u) => {
      if (isMounted) setUser(u);
    });
    return () => {
      isMounted = false; // prevent setting state after unmount
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
            {new Date(post.datePosted).toLocaleTimeString()}
          </p>
          <p> </p>
        </div>
      </div>
    </div>
  );
}

export default PostHeader;
