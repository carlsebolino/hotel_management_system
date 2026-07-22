export function UsersTable({ users }) {
  if (users.length === 0) {
    return <p className="empty-state">No users are available yet.</p>;
  }

  return (
    <table className="mt-4 w-full border-collapse text-left text-sm">
      <thead>
        <tr>
          <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Name
          </th>
          <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Email
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.email}>
            <td className="border-b border-slate-100 px-3 py-3 font-medium text-slate-800">
              {user.name}
            </td>
            <td className="border-b border-slate-100 px-3 py-3 text-slate-600">{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
