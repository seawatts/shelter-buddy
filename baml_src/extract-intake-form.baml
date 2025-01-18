// Defining a data model.
enum Gender {
  Male
  Female
}

enum DifficultyLevel {
  Yellow
  Purple
  Red
}

class IntakeForm {
  id string? @description("The animal ID number from the form")
  name string? @description("The animal's name from the form")
  breed string? @description("The breed listed on the form")
  gender Gender? @description("The gender of the animal")
  difficultyLevel DifficultyLevel? @description("The difficulty level indicated by the form's color coding")
  isFido bool? @description("Whether the animal is FIDO certified")
  generalNotes string? @description("Any general notes from the form")
  approvedActivities (Activity?)[]? @description("List of approved and non-approved activities")
  equipmentNotes Equipment? @description("Equipment and handling notes for in/out of kennel")
}

class Activity {
  activity string?
  isApproved bool?
}

class Equipment {
  inKennel (string?)[]?
  outOfKennel (string?)[]?
}

// Create a function to extract information from an animal shelter intake form image
function ExtractIntakeForm(image: image) -> IntakeForm {
  client GPT4o
  prompt #"
    You are an expert at analyzing animal shelter intake forms. Your task is to extract ONLY clearly visible and verifiable information from the form image into a standardized format. Do not make assumptions or fill in missing information.

    Critical Rules:
    - Only extract information that is explicitly visible on the form
    - If any field is unclear or missing, mark it as null/undefined rather than guessing
    - Do not infer or make assumptions about missing data
    - If you cannot clearly read or verify information, indicate that it's unreadable
    - Accuracy is more important than completeness

    Guidelines for extraction:
    1. Basic Information:
       - Animal ID: Only if clearly visible and complete
       - Name: Extract only if legibly written
       - Breed: Use exact breed information as written
       - Gender: Only mark M/F if explicitly indicated

    2. Difficulty Level:
       - Only mark Purple/Yellow/Red if there is a clear color indicator indicating the difficulty level.
       - If color coding is ambiguous or missing, mark as null

    3. FIDO Status:
       - Check if the animal is FIDO certified (Yes/No)
       - Only mark true if explicitly indicated as FIDO certified
       - If not clearly marked, set as false

    4. Activities:
       - Look for the "APPROVED ACTIVITIES" section
       - Each activity should be listed with a Yes/No indicator
       - Include all activities mentioned, whether approved or not
       - Mark as approved only if there is a clear Yes/Approved indicator

    5. Notes:
       - Extract any notes from the "GENERAL NOTES" section
       - Include medical information, dates, or special observations
       - Only include notes that are clearly legible
       - Do not attempt to interpret unclear handwriting
       - Maintain exact wording from the form

    6. Equipment & Handling:
       - Look for "IN KENNEL" and "OUT OF KENNEL" sections
       - Extract any handling instructions or equipment requirements
       - Include any specific behavioral notes for each context
       - Only include equipment and handling notes that are explicitly listed
       - Separate clearly between IN KENNEL and OUT OF KENNEL instructions
       - Do not infer equipment needs from other sections

    Extract only verifiable information into the following structured format:
    {{ ctx.output_format }}

    {{_.role('user')}}
    {{ image }}
  "#
}

// Test the function with a sample intake form
test TestIntakeForm {
  functions [ExtractIntakeForm]
  args {
    image {
      file "./intake2.jpeg"
    }
  }
  @assert(has_valid_id, {{ this.id.length > 0 }})
  @assert(has_valid_name, {{ this.name.length > 0 }})
  @assert(has_valid_breed, {{ this.breed.length > 0 }})
  @assert(has_valid_activities, {{ this.approvedActivities.length > 0 }})
  @assert(valid_activity_format, {{ this.approvedActivities.every(a => a.activity.length > 0) }})
}
