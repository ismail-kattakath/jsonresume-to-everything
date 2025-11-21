import DefaultResumeData from "@/components/resume-builder/utility/DefaultResumeData";

/**
 * Converts our DefaultResumeData format to JSON Resume standard format
 * Schema: https://jsonresume.org/schema/
 */
export function convertToJSONResume() {
  const data = DefaultResumeData;

  // Parse social media links
  const profiles = data.socialMedia.map((social) => ({
    network: social.socialMedia,
    username:
      social.socialMedia === "Github"
        ? social.link.replace("github.com/", "")
        : social.socialMedia === "LinkedIn"
          ? social.link.replace("linkedin.com/in/", "")
          : "",
    url: social.link.startsWith("http") ? social.link : `https://${social.link}`,
  }));

  // Convert work experience
  const work = data.workExperience.map((job) => ({
    name: job.company,
    position: job.position,
    url: job.url ? (job.url.startsWith("http") ? job.url : `https://${job.url}`) : undefined,
    startDate: job.startYear,
    endDate: job.endYear === "Present" ? "" : job.endYear,
    summary: job.description,
    highlights: job.keyAchievements.split("\n").filter((h) => h.trim()),
    keywords: job.technologies || [],
  }));

  // Convert education
  const education = data.education.map((edu) => ({
    institution: edu.school,
    url: edu.url ? (edu.url.startsWith("http") ? edu.url : `https://${edu.url}`) : undefined,
    area: "Computer Science and Engineering",
    studyType: "Bachelor's Degree",
    startDate: edu.startYear,
    endDate: edu.endYear,
  }));

  // Convert skills
  const skills = data.skills.map((skillGroup) => ({
    name: skillGroup.title,
    level: "",
    keywords: skillGroup.skills.map((s) => s.text),
  }));

  // Convert languages
  const languages = data.languages.map((lang) => ({
    language: lang,
    fluency: "Native speaker",
  }));

  // Parse address from the current format
  const addressParts = data.address.split(",").map((s) => s.trim());
  const location = {
    address: addressParts[0] || "",
    postalCode: addressParts[2]?.match(/[A-Z]\d[A-Z]\s?\d[A-Z]\d/)?.[0] || "",
    city: addressParts[1] || "",
    countryCode: "CA",
    region: addressParts[2]?.match(/[A-Z]{2}/)?.[0] || "ON",
  };

  const jsonResume = {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: data.name,
      label: data.position,
      image: data.profilePicture || "",
      email: data.email,
      phone: data.contactInformation,
      url: profiles.find((p) => p.network === "Website")?.url || "",
      summary: data.summary,
      location,
      profiles: profiles.filter((p) => p.network !== "Website"),
    },
    work,
    volunteer: [],
    education,
    awards: [],
    certificates: data.certifications || [],
    publications: [],
    skills,
    languages,
    interests: [],
    references: [],
    projects: [],
  };

  return jsonResume;
}
