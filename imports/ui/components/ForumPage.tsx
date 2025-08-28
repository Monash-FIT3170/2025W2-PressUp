import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { Select } from "./interaction/Select";
import { Button } from "./interaction/Button";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Post, PostsCollection } from "/imports/api/posts/PostsCollection";

export default function ForumPage() {
  useSubscribe("posts");
  const [posts, setPosts] = useState<Post[]>(
    useTracker(() => PostsCollection.find().fetch()),
  );
  const [selectedPost, setSelectedPost] = useState<Post>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const filteredPosts = posts.filter(
    (p) =>
      p.subject.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

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

          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="discussion">Discussion</option>
            <option value="question">Question</option>
          </Select>

          <Button width={"full"}>Start New Post</Button>
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
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedPost ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">{selectedPost.subject}</h1>
            <p className="text-gray-700">{selectedPost.content}</p>
          </div>
        ) : (
          <p className="text-gray-500 text-center p-10">
            {posts.length == 0 ? "" : "Select a post to view."}
          </p>
        )}
      </div>
    </div>
  );
}
