
export type tokenResponse = {
  access_token:string
  refresh_token:string
  expires_in:number
}

export type tokenQuery = {
  client_id:string
  client_secret:string
  grant_type:"client_credentials"
}

type image = {
  url:string
  height:number
  width:number
}

export type userResponse = {
  account_id: string;
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filtera_locked: boolean;
  };
  external_urls:{
    spotify:string

  }
  followers:{
    href:string
    total:number
  }
  href:string
  id:string
  images:image[]
  produce:string
  type:string
  uri:string
};

export type capsule = {
  name:string
  artists:artist[]
  revealDate:Date
}
type artist = "string"