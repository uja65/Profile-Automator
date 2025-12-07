import ProfileHeader from "../ProfileHeader";

export default function ProfileHeaderExample() {
  return (
    <ProfileHeader
      name="Christopher Nolan"
      role="Film Director, Producer, Screenwriter"
      bio="Christopher Edward Nolan is a British-American filmmaker known for his distinctive storytelling approach and visual style. His films have grossed over $5 billion worldwide and have received numerous accolades, including Academy Awards for Best Director and Best Picture for Oppenheimer (2023)."
      imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
      projectCount={12}
      yearsActive="1998 - Present"
      platforms={["imdb", "youtube", "vimeo"]}
      socialLinks={[
        { platform: "imdb", url: "https://imdb.com" },
        { platform: "youtube", url: "https://youtube.com" },
        { platform: "linkedin", url: "https://linkedin.com" },
      ]}
      confidence={0.94}
    />
  );
}
