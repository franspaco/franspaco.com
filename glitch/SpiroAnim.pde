
void setup() {
  size(1300,1300);
  colorMode(RGB);
  background(0);
  stroke(0,0,0);
  strokeWeight(1);
  smooth(128);
}

long nextUpdate = millis();

void draw(){
  if (nextUpdate<millis()){
    stroke(random(0,255),random(0,255),random(0,255));
    background(0);
    doDraw();
    updateUpdate();
  }
}

void doDraw(){
  print("Draw\n");
  float RA = int(random( 5, 20))*2;
  float RB = int(random(-15, 20))*2;
  float AL = int(random( 5, 15))*2;
  float adjust = 7;
  float angle = 0;
  float dA = 0.01; 
  float[] last = nextPoint(angle, RA, RB, AL, adjust);
  float stopAngle = 2*PI*lcm(abs(RA),abs(RB))/abs(RA);
  while(angle < stopAngle){
    float[] next = nextPoint(angle, RA, RB, AL, adjust); 
    line(last[0], last[1], next[0], next[1]);
    last = next;
    angle += dA;
  }
}

float dist(float[] A, float[] B){
  return sqrt(pow(A[0]-B[0], 2) + pow(A[1]-B[1], 2));
}

void updateUpdate(){
  nextUpdate = millis() + int(random(50, 150));
}

float [] nextPoint(float angle, float RA, float RB, float AL, float adjust){
  float X = (RA+RB)*cos(angle)-AL*cos((RA/RB+1)*angle);
  float Y = (RA+RB)*sin(angle)-AL*sin((RA/RB+1)*angle);
  X = X * adjust;
  Y = Y * adjust;
  X = X + (width/2);
  Y = -Y + (height/2);
  float[] res = new float[2];
  res[0] = X;
  res[1] = Y;
  return res;
}

float gcd(float a, float b){
  while(b > 0){
    float temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

float lcm(float a, float b){
  return a * (b/gcd(a,b));
}
