struct Abatross {
  1: string name
  2: i32 age
  3: string id
}

service AbatrossService {
  string getName(1: string id)
}