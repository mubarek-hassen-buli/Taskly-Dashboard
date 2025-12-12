Prompt for your agent

Implement a search feature using these rules:

Create a Convex query called searchItems that accepts a string argument q.

Fetch all documents from the target table and filter them on the server using
item.name.toLowerCase().includes(q.toLowerCase()).

If the search string is empty, return all items.

Add a debounced search input on the React side to avoid sending a query on every keystroke.
Use a 300ms debounce.

Use useQuery from Convex to fetch the results with the debounced value.

Display the results in a list under the search box.

Make sure the component re renders efficiently and does not trigger excessive refetching.

Keep everything simple and dependency free.

Follow these steps exactly and return working code for both the Convex query and the React component.