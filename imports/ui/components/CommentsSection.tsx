import { Meteor } from "meteor/meteor";
import { useEffect, useState } from "react";
import { useSubscribe } from "meteor/react-meteor-data";
import { Roles } from "meteor/alanning:roles";
import { Button } from "./interaction/Button";
import { TextArea } from "./interaction/TextArea";
import { ConfirmModal } from "./ConfirmModal";
import { IdType } from "/imports/api/database";
import Comment from "./Comment";

interface CommentProps {
  _id?: IdType;
  postedBy: string;
  datePosted: Date;
  content: string;
}

interface Post {
  _id: IdType;
  postedBy: string;
  datePosted: Date;
  subject: string;
  content: string;
  category: string; // TODO: 5.3 to implement this functionality
  comments?: CommentProps[];
}

interface CommentsSectionProps {
  post: Post;
}

function CommentsSection({ post }: CommentsSectionProps) {
  const [writingComment, setWritingComment] = useState<boolean>(false);
  const [content, setContent] = useState("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const [user, setUser] = useState<Meteor.User | null>(null);
  useSubscribe("posts");

  useEffect(() => {
    if (!post.postedBy) return;

    let isMounted = true;
    Meteor.call(
      "users.getBasicInfo",
      post.postedBy,
      (err: string, res: Meteor.User) => {
        if (isMounted && !err) {
          setUser(res);
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, [post.postedBy, user]);

  const handlePublishComment = () => {
    const newComment = {
      postedBy: Meteor.user()?._id,
      content: content,
    };
    Meteor.call(
      "posts.addComment",
      post._id,
      newComment,
      (error: Meteor.Error) => {
        if (error) {
          alert(`Error publishing comment: ${error.message}`);
        } else {
          setWritingComment(false);
        }
      },
    );
  };

  return (
    <div className="p-4">
      {writingComment ? (
        <div>
          <TextArea
            autoFocus
            placeholder="New comment"
            rows={2}
            onChange={(e) => setContent(e.target.value)}
          ></TextArea>
          <div className="flex w-full">
            <Button
              variant="negative"
              onClick={() => {
                content == ""
                  ? setWritingComment(false)
                  : setShowConfirmation(true);
              }}
            >
              Cancel
            </Button>
            <div className="ml-auto">
              <Button variant="positive" onClick={handlePublishComment}>
                Publish
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <Button width="full" onClick={() => setWritingComment(true)}>
            Add Comment
          </Button>
        </div>
      )}
      <div className="flex flex-col">
        {post.comments &&
          post.comments.map((comment: CommentProps) => (
            <Comment key={comment._id} comment={comment}></Comment>
          ))}
      </div>
      <ConfirmModal
        open={showConfirmation}
        message={"Are you sure you want to discard your comment?"}
        onConfirm={() => {
          setShowConfirmation(false);
          setWritingComment(false);
        }}
        onCancel={() => setShowConfirmation(false)}
      ></ConfirmModal>
    </div>
  );
}

export default CommentsSection;
