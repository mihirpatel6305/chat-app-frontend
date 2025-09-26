function addUnreadCount(users, unreadCounts) {
  return users.map((user) => {
    const match = unreadCounts.find((uc) => uc.userId === user._id);
    return {
      ...user,
      unreadCount: match ? match.unreadCount : 0,
    };
  });
}

export default addUnreadCount;
