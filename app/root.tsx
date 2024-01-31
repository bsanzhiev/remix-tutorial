import { useEffect, useState } from "react";
import {
	Form,
	Link,
	NavLink,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useNavigation,
} from "@remix-run/react";
import {
	LinksFunction,
	LoaderFunctionArgs,
	json,
	redirect,
} from "@remix-run/node";
import appStyleHref from "./app.css";
import { getContacts, createEmptyContact } from "./data";

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: appStyleHref },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q");
	const contacts = await getContacts();
	return json({ contacts, q });
};

export const action = async () => {
	const contact = await createEmptyContact();
	return redirect(`/contacts/${contact.id}/edit`);
	// return json({ contact });
};

export default function App() {
	const { contacts, q } = useLoaderData<typeof loader>();
	const navigation = useNavigation();

	const [query, setQuery] = useState(q || "");

	useEffect(() => {
		const searchField = document.getElementById("q");
		setQuery(q || "");
		if (searchField instanceof HTMLInputElement) {
			searchField.value = q || "";
		}
	}, [q]);

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<div id="sidebar">
					<h1>Remix Contacts</h1>
					<div>
						<Form id="search-form" role="search">
							<input
								id="q"
								aria-label="Search contacts"
								defaultValue={q || ""}
								// synchronize user's input to component state
								onChange={(event) => setQuery(event.currentTarget.value)}
								placeholder="Search"
								type="search"
								name="q"
								value={query}
							/>
							<div id="search-spinner" aria-hidden hidden={true} />
						</Form>
						<Form method="post">
							<button type="submit">New</button>
						</Form>
					</div>
					<nav>
						{contacts.length ? (
							<ul>
								{contacts.map((contact) => (
									<li key={contact.id}>
										<NavLink
											className={({ isActive, isPending }) =>
												isActive ? "active" : isPending ? "pending" : ""
											}
											to={`/contacts/${contact.id}`}
										>
											{contact.first || contact.last ? (
												<>
													{contact.first} {contact.last}
												</>
											) : (
												<i>No Name</i>
											)}{" "}
											{contact.favorite ? <span>*</span> : null}
										</NavLink>
									</li>
								))}
							</ul>
						) : (
							<p>
								<i>No contacts</i>
							</p>
						)}
					</nav>
				</div>
				<div
					className={navigation.state === "loading" ? "loading" : ""}
					id="detail"
				>
					<Outlet />
				</div>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
