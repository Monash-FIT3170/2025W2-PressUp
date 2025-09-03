import { FormEventHandler, useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import { Select } from "./interaction/Select";
import { Button } from "./interaction/Button";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Post, PostsCollection } from "/imports/api/posts/PostsCollection";
import { Modal } from "./Modal";
import { Form } from "./interaction/form/Form";
import { Meteor } from "meteor/meteor";
import { Input } from "./interaction/Input";
import { ConfirmModal } from "./ConfirmModal";
import PostHeader from "./PostHeader";
import { TextArea } from "./interaction/TextArea";
import CommentsSection from "./CommentsSection";

export default function ForumPage() {
  useSubscribe("posts");
  const posts = useTracker(() => PostsCollection.find().fetch());
  const [selectedPost, setSelectedPost] = useState<Post | undefined>();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [postModalOpen, setPostModalOpen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const filteredPosts = posts
    .filter(
      (p) =>
        (p.subject.toLowerCase().includes(search.toLowerCase()) ||
          p.content.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())) &&
        (categoryFilter === "" || p.category === categoryFilter),
    )
    .sort((a, b) => b.datePosted.getTime() - a.datePosted.getTime());
  const [subject, setSubject] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    Meteor.call(
      "posts.getCategories",
      (error: Meteor.Error, result: string[]) => {
        if (error) {
          console.error(error);
          setCategories([]);
        } else {
          setCategories(result.sort());
        }
      },
    );
  }, [posts]);

  const onCloseConfirmation = () => {
    setShowConfirmation(false);
    setPostModalOpen(false);
    setSubject("");
    setContent("");
    setCategory("");
  };

  const handleCreateNewPost: FormEventHandler = (e) => {
    e.preventDefault();

    Meteor.call(
      "posts.create",
      {
        postedBy: Meteor.user()?._id,
        subject: subject,
        content: content,
        category: category,
      },
      (error: Meteor.Error) => {
        if (error) {
          alert(`Error publishing post: ${error.message}`);
        } else {
          setPostModalOpen(false);
          setSubject("");
          setContent("");
          setCategory("");
        }
      },
    );
  };

  return (
    <div className="flex h-full">
      {/* LEFT PANEL */}
      <div className="w-1/3 border-r border-gray-300 flex flex-col">
        {/* Controls */}
        <div className="p-4 space-y-3 border-b bg-white">
          <SearchBar
            onSearch={setSearch}
            initialSearchTerm={search}
          ></SearchBar>

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>

          <Button width={"full"} onClick={() => setPostModalOpen(true)}>
            Start New Post
          </Button>
        </div>

        {/* Posts list */}
        <div className="flex-1 overflow-y-auto">
          {posts.length == 0 ? (
            <div className="p-10 text-center text-gray-500">
              No forum posts.
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post._id}
                className={`p-4 cursor-pointer border-b hover:bg-press-up-light-purple transition-all duration-200 ${
                  selectedPost?._id === post._id
                    ? "bg-press-up-light-purple"
                    : ""
                }`}
                onClick={() => setSelectedPost(post)}
              >
                <h3 className="font-semibold">{post.subject}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">
                  <span className="font-bold mr-2">{post.category}</span>
                  {post.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 px-12 py-6 overflow-y-auto">
        {selectedPost ? (
          <div>
            <PostHeader post={selectedPost}></PostHeader>
            <p className="text-gray-700 whitespace-pre-wrap border-b-1 border-gray-300 pb-8">
              {selectedPost.content}
            </p>
            <CommentsSection post={selectedPost}></CommentsSection>
          </div>
        ) : (
          <p className="text-gray-500 text-center p-10">
            {posts.length == 0 ? "" : "Select a post to view."}
          </p>
        )}
      </div>
      {postModalOpen && (
        <Modal
          open={postModalOpen}
          onClose={() => {
            setShowConfirmation(true);
          }}
        >
          <Form onSubmit={handleCreateNewPost} title={"Create Post"}>
            <div className="mb-4">
              <Input
                placeholder="Post Title"
                type="text"
                onChange={(e) => setSubject(e.target.value)}
                required
              ></Input>
            </div>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                autoComplete="off"
                list="categories"
                required
              />
              <datalist id="categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div className="mb-4">
              <TextArea
                placeholder="Write your forum message here..."
                rows={8}
                onChange={(e) => setContent(e.target.value)}
                required
              ></TextArea>
            </div>
            <Button width="full" type="submit">
              Publish
            </Button>
          </Form>
        </Modal>
      )}
      <ConfirmModal
        open={showConfirmation}
        message="Are you sure you want to discard your changes?"
        onConfirm={onCloseConfirmation}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
}
