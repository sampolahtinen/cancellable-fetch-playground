import { Box, Input, ThemeProvider } from "theme-ui";
import { dark } from "@theme-ui/presets";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce/lib";
import "./styles.css";

const swapiUrl = "https://swapi.dev/api";

const wait = (time: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve("ok"), time);
  });

type Person = {
  name: string;
  [x: string]: string;
};

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [controller, setController] = useState(new AbortController());
  const [isFetching, setIsFetching] = useState(false);

  const getManyPeople = async (query?: string, signal?: AbortSignal) => {
    const url = query
      ? `${swapiUrl}/people/?search=${query}`
      : `${swapiUrl}/people`;

    try {
      setIsFetching(true);

      const res = await fetch(url, { signal });
      const people = await res.json();

      setPeople(people.results);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    getManyPeople();
  }, []);

  const debouncedSearch = useDebouncedCallback(
    (query: string, signal: AbortSignal) => {
      getManyPeople(query, signal);
    },
    500
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (isFetching) {
      controller.abort();
    }

    const nextController = new AbortController();

    setController(nextController);

    debouncedSearch(value, nextController.signal);
  };

  return (
    <ThemeProvider theme={dark}>
      <Box sx={{ padding: "32px" }}>
        <h1>Cancellable fetch</h1>
        <h2>Previous query cancels when user inputs new query!</h2>
        <Input placeholder="Search for people" onChange={handleSearch} />
        <ul>
          {people.map((person) => (
            <li key={person.name}>{person.name}</li>
          ))}
        </ul>
      </Box>
    </ThemeProvider>
  );
}
