
-- Insert sample user profiles for testing
INSERT INTO public.profiles (id, username, full_name, avatar_url, handicap)
VALUES 
  (gen_random_uuid(), 'johndoe', 'John Doe', 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/1.jpg', 8.5),
  (gen_random_uuid(), 'janesmith', 'Jane Smith', 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/2.jpg', 12.3),
  (gen_random_uuid(), 'mikejohnson', 'Mike Johnson', 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/3.jpg', 5.7),
  (gen_random_uuid(), 'sarahwilliams', 'Sarah Williams', 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/4.jpg', 15.2),
  (gen_random_uuid(), 'davebrown', 'Dave Brown', 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/5.jpg', 10.8),
  (gen_random_uuid(), 'amymiller', 'Amy Miller', 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/6.jpg', 18.4),
  (gen_random_uuid(), 'robertjones', 'Robert Jones', 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/7.jpg', 3.2),
  (gen_random_uuid(), 'lisawilson', 'Lisa Wilson', 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/8.jpg', 7.6),
  (gen_random_uuid(), 'alexthompson', 'Alex Thompson', 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/9.jpg', 9.1),
  (gen_random_uuid(), 'christinagarcia', 'Christina Garcia', 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/10.jpg', 6.4);
