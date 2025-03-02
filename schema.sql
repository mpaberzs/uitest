create table if not exists users (
  id uuid not null default gen_random_uuid(),
  email varchar(255) not null,
  password text not null,
  first_name varchar(255),
  last_name varchar(255),
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp,

  primary key (id),
  unique (email)
);

create table if not exists user_auth_tokens (
  id serial,
  user_id uuid not null,
  token_id uuid not null,
  valid boolean not null default true,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp,

  primary key (id),
  foreign key (user_id) references users(id) on delete cascade,
  unique (token_id)
);

create table if not exists task_lists (id uuid not null default gen_random_uuid(),
  created_by uuid,
  name varchar(255) not null,
  status varchar(255) not null default 'active',
  description text,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp,

  primary key (id),
  foreign key (created_by) references users(id));

create table if not exists tasks (id uuid not null default gen_random_uuid(),
  task_list_id uuid not null,
  created_by uuid,
  name varchar(255) not null,
  status varchar(255) not null default 'active',
  description text,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp,

  primary key (id),
  foreign key (created_by) references users(id)
);

create table if not exists task_list_access (
  id serial not null,
  task_list_id uuid not null,
  delegated_to uuid not null,
  delegated_by uuid,
  level smallint not null default 3,
  updated_at timestamp not null default current_timestamp,
  delegated_at timestamp not null default current_timestamp,
  expires_at timestamp,

  primary key (id),
  foreign key (delegated_by) references users(id) on delete no action,
  foreign key (delegated_to) references users(id) on delete cascade,
  foreign key (task_list_id) references task_lists(id) on delete cascade,
  unique (task_list_id, delegated_to)
);

create table if not exists collaboration_invites (
  id uuid not null default gen_random_uuid(),
  task_list_id uuid not null,
  access_level smallint not null,
  hash text not null,

  expires_at timestamp not null default current_timestamp + interval '7' day,
  accepted boolean not null default false,
  inviter_id uuid not null,
  link text not null,
  accepter_id uuid,

  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp,

  primary key (id),
  foreign key (inviter_id) references users(id) on delete no action,
  foreign key (accepter_id) references users(id) on delete no action,
  unique (hash)
);

