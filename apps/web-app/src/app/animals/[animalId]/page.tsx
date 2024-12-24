import { mockAnimals } from "../_mock-data/animals";
import { AnimalDetails } from "./_components/animal-details";

interface PageProps {
  params: Promise<{
    animalId: string;
  }>;
}

// This is a mock function - replace with actual data fetching
function getAnimal(animalId: string) {
  return mockAnimals.find((animal) => animal.id === animalId) ?? null;
}

export default async function AnimalPage({ params }: PageProps) {
  const { animalId } = await params;
  const animal = getAnimal(animalId);

  if (!animal) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-red-500">Animal Not Found</h1>
        <p className="mt-4">
          The animal with ID {animalId} could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <AnimalDetails animal={animal} />
    </div>
  );
}
