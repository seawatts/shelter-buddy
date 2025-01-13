/*************************************************************************************************

Welcome to Baml! To use this generated code, please run one of the following:

$ npm install @boundaryml/baml
$ yarn add @boundaryml/baml
$ pnpm add @boundaryml/baml

*************************************************************************************************/

// This file was generated by BAML: do not edit it. Instead, edit the BAML
// files and re-generate this code.
//
/* eslint-disable */
// tslint:disable
// @ts-nocheck
// biome-ignore format: autogenerated code
const fileMap = {
  
  "clients.baml": "retry_policy RetryPolicy {\n  max_retries 3\n  strategy {\n    type exponential_backoff\n  }\n}\n\nclient<llm> GPT4o {\n  provider openai\n  retry_policy RetryPolicy\n  options {\n    model \"gpt-4o\"\n    api_key env.OPENAI_API_KEY\n    temperature 0\n  }\n}\n\nclient<llm> GPT4oMini {\n  provider openai\n  retry_policy RetryPolicy\n  options {\n    model \"gpt-4o-mini\"\n    api_key env.OPENAI_API_KEY\n    // strategy [\n    //   GPT4o\n    // ]\n  }\n}\n\nclient<llm> GPT4oMini0Temperature {\n  provider openai\n  retry_policy RetryPolicy\n  options {\n    model \"gpt-4o-mini\"\n    api_key env.OPENAI_API_KEY\n    temperature 0\n  }\n}\n\nclient<llm> Claude {\n  provider anthropic\n  options {\n    model \"claude-3-5-sonnet-20240620\"\n    // model \"claude-3-haiku-20240307\"\n    api_key env.ANTHROPIC_API_KEY\n    allowed_role_metadata [\"cache_control\"]\n    headers {\n      \"anthropic-beta\" \"prompt-caching-2024-07-31\"\n    }\n  }\n}\n\nclient<llm> FastAnthropic {\n  provider anthropic\n  options {\n    model \"claude-3-haiku-20240307\"\n    api_key env.ANTHROPIC_API_KEY\n  }\n}\n\nclient<llm> Fast {\n  provider round-robin\n  options {\n    // This will alternate between the two clients\n    strategy [FastAnthropic, GPT4oMini]\n  }\n}\n\nclient<llm> Openai {\n  provider fallback\n  options {\n    // This will try the clients in order until one succeeds\n    strategy [GPT4o, GPT4oMini]\n  }\n}",
  "extract-intake-form.baml": "// Defining a data model.\nenum Gender {\n  Male\n  Female\n}\n\nenum DifficultyLevel {\n  Yellow\n  Purple\n  Red\n}\n\nclass IntakeForm {\n  id string @description(\"The animal ID number from the form\")\n  name string @description(\"The animal's name from the form\")\n  breed string @description(\"The breed listed on the form\")\n  gender Gender @description(\"The gender of the animal\")\n  difficultyLevel DifficultyLevel @description(\"The difficulty level indicated by the form's color coding\")\n  isFido bool @description(\"Whether the animal is FIDO certified\")\n  generalNotes string? @description(\"Any general notes from the form\")\n  approvedActivities Activity[] @description(\"List of approved and non-approved activities\")\n  equipmentNotes Equipment @description(\"Equipment and handling notes for in/out of kennel\")\n}\n\nclass Activity {\n  activity string\n  isApproved bool\n}\n\nclass Equipment {\n  inKennel string[]\n  outOfKennel string[]\n}\n\n// Create a function to extract information from an animal shelter intake form image\nfunction ExtractIntakeForm(image: image) -> IntakeForm {\n  client GPT4o\n  prompt #\"\n    You are an expert at analyzing animal shelter intake forms. Your task is to extract ONLY clearly visible and verifiable information from the form image into a standardized format. Do not make assumptions or fill in missing information.\n\n    Critical Rules:\n    - Only extract information that is explicitly visible on the form\n    - If any field is unclear or missing, mark it as null/undefined rather than guessing\n    - Do not infer or make assumptions about missing data\n    - If you cannot clearly read or verify information, indicate that it's unreadable\n    - Accuracy is more important than completeness\n\n    Guidelines for extraction:\n    1. Basic Information:\n       - Animal ID: Only if clearly visible and complete\n       - Name: Extract only if legibly written\n       - Breed: Use exact breed information as written\n       - Gender: Only mark M/F if explicitly indicated\n\n    2. Difficulty Level:\n       - Only mark Purple/Yellow/Red if there is a clear color indicator indicating the difficulty level.\n       - If color coding is ambiguous or missing, mark as null\n\n    3. FIDO Status:\n       - Check if the animal is FIDO certified (Yes/No)\n       - Only mark true if explicitly indicated as FIDO certified\n       - If not clearly marked, set as false\n\n    4. Activities:\n       - Look for the \"APPROVED ACTIVITIES\" section\n       - Each activity should be listed with a Yes/No indicator\n       - Include all activities mentioned, whether approved or not\n       - Mark as approved only if there is a clear Yes/Approved indicator\n\n    5. Notes:\n       - Extract any notes from the \"GENERAL NOTES\" section\n       - Include medical information, dates, or special observations\n       - Only include notes that are clearly legible\n       - Do not attempt to interpret unclear handwriting\n       - Maintain exact wording from the form\n\n    6. Equipment & Handling:\n       - Look for \"IN KENNEL\" and \"OUT OF KENNEL\" sections\n       - Extract any handling instructions or equipment requirements\n       - Include any specific behavioral notes for each context\n       - Only include equipment and handling notes that are explicitly listed\n       - Separate clearly between IN KENNEL and OUT OF KENNEL instructions\n       - Do not infer equipment needs from other sections\n\n    Extract only verifiable information into the following structured format:\n    {{ ctx.output_format }}\n\n    {{_.role('user')}}\n    {{ image }}\n  \"#\n}\n\n// Test the function with a sample intake form\ntest TestIntakeForm {\n  functions [ExtractIntakeForm]\n  args {\n    image {\n      file \"./intake2.jpeg\"\n    }\n  }\n  @assert(has_valid_id, {{ this.id.length > 0 }})\n  @assert(has_valid_name, {{ this.name.length > 0 }})\n  @assert(has_valid_breed, {{ this.breed.length > 0 }})\n  @assert(has_valid_activities, {{ this.approvedActivities.length > 0 }})\n  @assert(valid_activity_format, {{ this.approvedActivities.every(a => a.activity.length > 0) }})\n}\n",
  "generators.baml": "// This helps use auto generate libraries you can use in the language of\n// your choice. You can have multiple generators if you use multiple languages.\n// Just ensure that the output_dir is different for each generator.\ngenerator target {\n    // Valid values: \"python/pydantic\", \"typescript\", \"ruby/sorbet\", \"rest/openapi\"\n    output_type \"typescript\"\n\n    // Where the generated code will be saved (relative to baml_src/)\n    output_dir \"../\"\n\n    // The version of the BAML package you have installed (e.g. same version as your baml-py or @boundaryml/baml).\n    // The BAML VSCode extension version should also match this version.\n    version \"0.72.0\"\n\n    // Valid values: \"sync\", \"async\"\n    // This controls what `b.FunctionName()` will be (sync or async).\n    default_client_mode async\n}\n",
}
export const getBamlFiles = () => {
    return fileMap;
}